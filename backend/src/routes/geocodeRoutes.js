import express from 'express';
import mongoose from 'mongoose';
import { SearchHistory } from '../models/SearchHistory.js';

const router = express.Router();

// Stałe
const OTP_BASE_URL = process.env.OTP_BASE_URL || 'http://host.docker.internal:8080';
const OTP_FETCH_TIMEOUT_MS = Number(process.env.OTP_FETCH_TIMEOUT_MS || 2500);
const OTP_STOPS_CACHE_TTL_MS = Number(process.env.OTP_STOPS_CACHE_TTL_MS || 15000);
const otpStopsCache = new Map();
const GDANSK_BBOX = {
    minLon: 18.35,
    minLat: 54.25,
    maxLon: 18.75,
    maxLat: 54.45
};

// Helpers
function getCollection(name) {
    if (mongoose.connection.readyState !== 1) throw new Error('MongoDB nie jest połączone');
    return mongoose.connection.db.collection(name);
}

async function fetchOTPStops(query) {
    const cacheKey = query.trim().toLowerCase();
    const now = Date.now();
    const cachedValue = otpStopsCache.get(cacheKey);
    if (cachedValue && cachedValue.expiresAt > now) {
        return cachedValue.data;
    }

    try {
        const otpParams = new URLSearchParams({ query, autocomplete: 'true', stops: 'true', clusters: 'true', corners: 'true' });
        const otpUrl = `${OTP_BASE_URL}/otp/geocode?${otpParams.toString()}`;
        console.log(`Fetching OTP stops from: ${otpUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), OTP_FETCH_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(otpUrl, { signal: controller.signal });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            console.error(`OTP geocode error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const results = Array.isArray(data) ? data : [];

        const mappedResults = results.map((result, idx) => {
            const lat = Number(result.lat) || 0;
            const lng = Number(result.lng) || 0;
            const description = result.description || '';
            const id = result.id || `otp-${idx}`;
            const displayName = description.replace(/\s*\(\d+\)\s*$/, '').trim();

            return {
                display_name: displayName || 'Bez nazwy',
                lat,
                lon: lng,
                type: 'stop',
                uniqueKey: `otp-${id}-${idx}`,
                city: null
            };
        });

        otpStopsCache.set(cacheKey, {
            data: mappedResults,
            expiresAt: now + OTP_STOPS_CACHE_TTL_MS
        });

        return mappedResults;
    } catch (err) {
        console.error('OTP Geocoder błąd:', err?.message || err);
        return [];
    }
}

function buildGeoFilter() {
    return { city: { $regex: '^(gdańsk|gdansk|kolbudy|otomin)$', $options: 'i' } };
}

function isInGdanskArea(addr) {
    const location = addr.location || {};
    const coords = location.coordinates || [];
    if (coords.length >= 2) {
        const lon = coords[0];
        const lat = coords[1];
        return lon >= GDANSK_BBOX.minLon && lon <= GDANSK_BBOX.maxLon && lat >= GDANSK_BBOX.minLat && lat <= GDANSK_BBOX.maxLat;
    }

    if (addr.lon != null && addr.lat != null) {
        return addr.lon >= GDANSK_BBOX.minLon && addr.lon <= GDANSK_BBOX.maxLon && addr.lat >= GDANSK_BBOX.minLat && addr.lat <= GDANSK_BBOX.maxLat;
    }

    const city = (addr.city || '').toLowerCase();
    return city.includes('gdańsk') || city.includes('gdansk') || city.includes('kolbudy') || city.includes('otomin');
}

async function getDistrictForPoint(lon, lat) {
    try {
        if (!lon || !lat) return null;

        const district = await getCollection('districts').findOne({
            geometry: { $geoIntersects: { $geometry: { type: 'Point', coordinates: [lon, lat] } } }
        });

        return district ? (district.short_name || district.name || null) : null;
    } catch (error) {
        console.error('Błąd sprawdzania dzielnicy:', error);
        return null;
    }
}

function parseQueryParts(query) {
    const q = query.toLowerCase().trim();
    const numberMatch = q.match(/\s+(\d+[a-z]*)\s*$/);
    if (numberMatch) {
        return { streetQuery: q.substring(0, numberMatch.index).trim(), houseNumberQuery: numberMatch[1] };
    }
    return { streetQuery: q, houseNumberQuery: null };
}

export const geocodeTestUtils = {
    fetchOTPStops,
    buildGeoFilter,
    isInGdanskArea,
    parseQueryParts,
    clearOtpStopsCache: () => otpStopsCache.clear()
};

router.get('/', async (req, res) => {
    const query = req.query.q || req.query.prefix || '';
    const limit = parseInt(req.query.limit) || 20;
    if (!query || query.length < 2) return res.json([]);

    try {
        const addresses = getCollection('addresses');
        console.log('Search request received. Query:', query);

        if (query && query.length >= 2) {
            SearchHistory.create({ query: query.trim() }).catch(err => console.error('Błąd zapisu historii wyszukiwań:', err));
        }

        if (req.query.q) {
            const { streetQuery, houseNumberQuery } = parseQueryParts(query);
            const geoFilter = buildGeoFilter();

            let streets = [];
            if (!houseNumberQuery) {
                streets = await addresses.aggregate([
                    { $match: { $and: [{ street: { $regex: streetQuery, $options: 'i' } }, geoFilter] } },
                    { $group: { _id: '$street' } },
                    { $sort: { _id: 1 } },
                    { $limit: 10 }
                ]).toArray();
            }

            const addressMatchConditions = [{ street: { $regex: streetQuery, $options: 'i' } }, { housenumber: { $exists: true, $ne: '' } }, geoFilter];
            if (houseNumberQuery) {
                const houseNumberInt = parseInt(houseNumberQuery);
                addressMatchConditions.push({ $or: [{ housenumber: { $regex: `^${houseNumberQuery}`, $options: 'i' } }, { housenumber: houseNumberInt }] });
            }

            const [addressesResults, otpStops] = await Promise.all([
                addresses.find({ $and: addressMatchConditions }).sort({ street: 1, housenumber_int: 1 }).limit(houseNumberQuery ? 20 : 15).toArray(),
                fetchOTPStops(query)
            ]);

            const results = [];

            // Streets: pobieramy równolegle pierwszy adres dla każdej ulicy, żeby sprawdzić dzielnicę
            if (streets.length) {
                const streetPromises = streets.map(async (street, idx) => {
                    const firstAddress = await addresses.findOne({ $and: [{ street: street._id }, geoFilter, { 'location.coordinates.0': { $exists: true } }] })
                        || await addresses.findOne({ $and: [{ street: street._id }, geoFilter] });

                    let districtName = null;
                    let lon = 0;
                    let lat = 0;

                    if (firstAddress) {
                        const coords = (firstAddress.location && firstAddress.location.coordinates) || [];
                        lon = coords[0] || firstAddress.lon || 0;
                        lat = coords[1] || firstAddress.lat || 0;
                        if (lon && lat) districtName = await getDistrictForPoint(lon, lat);
                    }

                    return {
                        display_name: street._id,
                        lat,
                        lon,
                        type: 'street',
                        uniqueKey: `street-${street._id}-${idx}`,
                        city: null,
                        district: districtName
                    };
                });

                const streetResults = await Promise.all(streetPromises);
                results.push(...streetResults);
            }

            // Addresses: filtrujemy i obliczamy dzielnice równolegle
            const addressPromises = addressesResults.map(async (addr, idx) => {
                if (!isInGdanskArea(addr)) return null;
                const displayName = addr.housenumber ? `${addr.street} ${addr.housenumber}` : addr.street;
                const coords = (addr.location && addr.location.coordinates) || [];
                const lon = coords[0] || addr.lon || 0;
                const lat = coords[1] || addr.lat || 0;
                const districtName = (lon && lat) ? await getDistrictForPoint(lon, lat) : null;
                return {
                    display_name: displayName,
                    lat,
                    lon,
                    type: 'address',
                    uniqueKey: `address-${addr.street}-${addr.housenumber}-${idx}`,
                    city: addr.city || null,
                    district: districtName
                };
            });

            const addressResultsProcessed = (await Promise.all(addressPromises)).filter(Boolean);
            results.push(...addressResultsProcessed);

            // OTP stops: obliczamy dzielnice równolegle
            const otpWithDistricts = await Promise.all(otpStops.map(async stop => {
                const district = (stop.lon && stop.lat) ? await getDistrictForPoint(stop.lon, stop.lat) : null;
                return { ...stop, district };
            }));
            results.push(...otpWithDistricts);

            // Sortowanie: najpierw przystanki, potem adresy, potem ulice
            results.sort((a, b) => {
                const typeOrder = { stop: 1, address: 2, street: 3 };
                const aOrder = typeOrder[a.type] || 99;
                const bOrder = typeOrder[b.type] || 99;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return (a.display_name || '').localeCompare(b.display_name || '');
            });

            return res.json(results.slice(0, limit));
        }

        const geoFilter = buildGeoFilter();
        const addressesCol = getCollection('addresses');
        const streets = await addressesCol.aggregate([
            { $match: { $and: [{ street: { $regex: `^${query}`, $options: 'i' } }, geoFilter] } },
            { $group: { _id: '$street' } },
            { $sort: { _id: 1 } },
            { $limit: limit }
        ]).toArray();

        res.json(streets.map(s => s._id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

router.get('/housenumbers', async (req, res) => {
    const street = req.query.street;
    if (!street) return res.status(400).json({ error: 'Brak parametru street' });

    try {
        const addresses = getCollection('addresses');
        const geoFilter = buildGeoFilter();
        const houses = await addresses.find({ $and: [{ street }, geoFilter] }).sort({ housenumber_int: 1 }).toArray();

        res.json(houses.map(h => ({ housenumber: h.housenumber, city: h.city, postcode: h.postcode, location: h.location })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

export default router;
