import express from 'express';
import mongoose from 'mongoose';
import { SearchHistory } from '../models/SearchHistory.js';

const router = express.Router();

// Funkcja do pobierania przystanków z OTP
async function fetchOTPStops(query) {
    try {
        const otpParams = new URLSearchParams({
            query: query,
            autocomplete: 'true',
            stops: 'true',
            clusters: 'true',
            corners: 'true',
        });
        
        const otpBaseUrl = process.env.OTP_BASE_URL || 'http://host.docker.internal:8080';
        const otpUrl = `${otpBaseUrl}/otp/geocode?${otpParams.toString()}`;
        
        console.log(`Fetching OTP stops from: ${otpUrl}`);

        const response = await fetch(otpUrl);

        if (!response.ok) {
            console.error(`OTP geocode error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const results = Array.isArray(data) ? data : [];

        return results.map((result, idx) => {
            const lat = result.lat || 0;
            const lng = result.lng || 0;
            const description = result.description || '';
            const id = result.id || `otp-${idx}`;

            // Usuwanie liczb w nawiasach na końcu (np. "(123)")
            let displayName = description.replace(/\s*\(\d+\)\s*$/, '').trim();

            return {
                display_name: displayName || 'Bez nazwy',
                lat: Number(lat) || 0,
                lon: Number(lng) || 0,
                type: 'stop',
                uniqueKey: `otp-${id}-${idx}`,
                city: null
            };
        });
    } catch (err) {
        console.error('OTP Geocoder błąd:', err.message);
        return [];
    }
}

const GDANSK_BBOX = {
    minLon: 18.35,
    minLat: 54.25,
    maxLon: 18.75,
    maxLat: 54.45 
};

function getDistrictsCollection() {
    if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB nie jest połączone');
    }
    return mongoose.connection.db.collection('districts');
}

function getAddressesCollection() {
    if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB nie jest połączone');
    }
    return mongoose.connection.db.collection('addresses');
}

// Funkcja do filtrowania geograficznego - sprawdza czy adres jest w obszarze Gdańska
function isInGdanskArea(addr) {
    const location = addr.location || {};
    const coords = location.coordinates || [];
    
    // Jeśli mamy współrzędne w formacie GeoJSON [lon, lat]
    if (coords.length >= 2) {
        const lon = coords[0];
        const lat = coords[1];
        return lon >= GDANSK_BBOX.minLon && lon <= GDANSK_BBOX.maxLon &&
               lat >= GDANSK_BBOX.minLat && lat <= GDANSK_BBOX.maxLat;
    }
    
    // Jeśli mamy pola lon/lat bezpośrednio
    if (addr.lon && addr.lat) {
        return addr.lon >= GDANSK_BBOX.minLon && addr.lon <= GDANSK_BBOX.maxLon &&
               addr.lat >= GDANSK_BBOX.minLat && addr.lat <= GDANSK_BBOX.maxLat;
    }
    
    // Jeśli nie ma współrzędnych, sprawdź po mieście/gminie
    const city = (addr.city || '').toLowerCase();
    return city.includes('gdańsk') || city.includes('gdansk') || 
           city.includes('kolbudy') || city.includes('otomin');
}

async function getDistrictForPoint(lon, lat) {
    try {
        if (!lon || !lat || lon === 0 || lat === 0) {
            return null;
        }

        const district = await getDistrictsCollection().findOne({
            geometry: {
                $geoIntersects: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lon, lat]
                    }
                }
            }
        });

        if (district) {
            return district.short_name || district.name || null;
        }
        return null;
    } catch (error) {
        console.error('Błąd sprawdzania dzielnicy:', error);
        return null;
    }
}

router.get('/', async (req, res) => {
    const query = req.query.q || req.query.prefix || '';
    const limit = parseInt(req.query.limit) || 20;

    // Jeśli brak parametru q lub prefix, zwróć pustą tablicę
    if (!query || query.length < 2) {
        return res.json([]);
    }

    try {
        const addresses = getAddressesCollection();
        
        console.log('Search request received. Query:', query);

        // Save search query to history (async, don't await to not block response)
        if (query && query.length >= 2) {
            console.log('Saving query to history:', query.trim());
            SearchHistory.create({ query: query.trim() })
                .then(() => console.log('Query saved successfully'))
                .catch(err => console.error('Error saving search history:', err));
        } else {
            console.log('Query too short or empty, not saving.');
        }

        // Jeśli jest parametr 'q', zwróć pełne wyniki (ulice + adresy) w formacie dla frontendu
        if (req.query.q) {
            const queryLower = query.toLowerCase().trim();
            
            // Warunek geograficzny dla obszaru Gdańska
            // Wymuszamy filtrowanie po mieście - to wykluczy Gdynię nawet jeśli bounding box byłby za duży
            // Używamy ^ i $ w regex, żeby dopasować dokładnie nazwę miasta (nie fragment)
            // Flaga 'i' sprawia, że dopasowanie jest case-insensitive (Gdańsk, gdańsk, GDAŃSK itp.)
            const geoFilter = {
                city: { $regex: '^(gdańsk|gdansk|kolbudy|otomin)$', $options: 'i' }
            };
            
            // Sprawdź czy zapytanie zawiera numer (np. "Konna 22" -> ulica: "Konna", numer: "22")
            const numberMatch = queryLower.match(/\s+(\d+[a-z]*)\s*$/);
            let streetQuery = queryLower;
            let houseNumberQuery = null;
            
            if (numberMatch) {
                // Zapytanie zawiera numer - rozdziel na część ulicy i numer
                houseNumberQuery = numberMatch[1];
                streetQuery = queryLower.substring(0, numberMatch.index).trim();
            }
            
            // Wyszukiwanie ulic (unikalne) - tylko z obszaru Gdańska
            // Jeśli jest numer w zapytaniu, nie pokazuj ulic (tylko konkretne adresy)
            let streets = [];
            if (!houseNumberQuery) {
                streets = await addresses.aggregate([
                    { 
                        $match: { 
                            $and: [
                                { street: { $regex: streetQuery, $options: 'i' } },
                                geoFilter
                            ]
                        } 
                    },
                    { $group: { _id: '$street' } },
                    { $sort: { _id: 1 } },
                    { $limit: 10 }
                ]).toArray();
            }

            // Wyszukiwanie adresów - jeśli jest numer w zapytaniu, szukaj dokładnego dopasowania
            const addressMatchConditions = [
                { street: { $regex: streetQuery, $options: 'i' } },
                { housenumber: { $exists: true, $ne: '' } },
                geoFilter
            ];
            
            // Jeśli zapytanie zawiera numer, dodaj warunek na numer domu
            if (houseNumberQuery) {
                // W bazie mogą być zarówno stringi ("27B", "26B") jak i numbery (27, 26)
                // Musimy obsłużyć oba przypadki
                const houseNumberInt = parseInt(houseNumberQuery);
                
                addressMatchConditions.push({
                    $or: [
                        // Jeśli housenumber jest stringiem - użyj regex (znajdzie "27", "27B", "27A" itp.)
                        { 
                            housenumber: { 
                                $regex: `^${houseNumberQuery}`, 
                                $options: 'i' 
                            } 
                        },
                        // Jeśli housenumber jest numberem - porównaj bezpośrednio (znajdzie 27, 26 itp.)
                        { 
                            housenumber: houseNumberInt 
                        }
                    ]
                });
            }
            
            // Równoległe pobieranie: adresy z MongoDB i przystanki z OTP
            const [addressesResults, otpStops] = await Promise.all([
                addresses.find({
                    $and: addressMatchConditions
                })
                .sort({ street: 1, housenumber_int: 1 })
                .limit(houseNumberQuery ? 20 : 15)
                .toArray(),
                fetchOTPStops(query) // Pobierz przystanki z OTP
            ]);

            // Formatowanie wyników dla frontendu
            const results = [];

            // Dla ulic - pobierz pierwszy adres z ulicy, żeby sprawdzić dzielnicę
            for (let idx = 0; idx < streets.length; idx++) {
                const street = streets[idx];
                // Pobierz pierwszy adres z tej ulicy, żeby sprawdzić dzielnicę
                const firstAddress = await addresses.findOne({
                    $and: [
                        { street: street._id },
                        geoFilter
                    ]
                });

                let districtName = null;
                if (firstAddress) {
                    const location = firstAddress.location || {};
                    const coords = location.coordinates || [];
                    const lon = coords[0] || firstAddress.lon;
                    const lat = coords[1] || firstAddress.lat;
                    if (lon && lat) {
                        districtName = await getDistrictForPoint(lon, lat);
                    }
                }

                results.push({
                    display_name: street._id,
                    lat: 0, // ulice nie mają konkretnej lokalizacji
                    lon: 0,
                    type: 'street',
                    uniqueKey: `street-${street._id}-${idx}`,
                    city: null,
                    district: districtName
                });
            }

            // Dodaj adresy jako typ 'address' (tylko te z obszaru Gdańska)
            for (let idx = 0; idx < addressesResults.length; idx++) {
                const addr = addressesResults[idx];
                if (!isInGdanskArea(addr)) {
                    continue; // Pomiń adresy poza obszarem
                }
                
                const displayName = addr.housenumber 
                    ? `${addr.street} ${addr.housenumber}`
                    : addr.street;
                
                const location = addr.location || {};
                const coords = location.coordinates || [];
                const lon = coords[0] || addr.lon || 0;
                const lat = coords[1] || addr.lat || 0;

                // Sprawdź do jakiej dzielnicy należy adres
                const districtName = await getDistrictForPoint(lon, lat);
                
                results.push({
                    display_name: displayName,
                    lat: lat,
                    lon: lon,
                    type: 'address',
                    uniqueKey: `address-${addr.street}-${addr.housenumber}-${idx}`,
                    city: addr.city || null,
                    district: districtName
                });
            }

            // Dodaj przystanki z OTP (ze sprawdzeniem dzielnicy)
            for (const stop of otpStops) {
                let districtName = null;
                if (stop.lon && stop.lat) {
                    districtName = await getDistrictForPoint(stop.lon, stop.lat);
                }
                results.push({
                    ...stop,
                    district: districtName
                });
            }

            // Sortowanie: najpierw przystanki, potem adresy, potem ulice
            results.sort((a, b) => {
                const typeOrder = { stop: 1, address: 2, street: 3 };
                const aOrder = typeOrder[a.type] || 99;
                const bOrder = typeOrder[b.type] || 99;
                
                if (aOrder !== bOrder) {
                    return aOrder - bOrder;
                }
                return a.display_name.localeCompare(b.display_name);
            });

            return res.json(results.slice(0, limit));
        }
        
        const geoFilter = {
            city: { $regex: '^(gdańsk|gdansk|kolbudy|otomin)$', $options: 'i' }
        };
        
        const streets = await addresses.aggregate([
            { 
                $match: { 
                    $and: [
                        { street: { $regex: `^${query}`, $options: 'i' } },
                        geoFilter
                    ]
                } 
            },
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
        const addresses = getAddressesCollection();
        
        // Filtrowanie geograficzne dla obszaru Gdańska
        const geoFilter = {
            city: { $regex: '^(gdańsk|gdansk|kolbudy|otomin)$', $options: 'i' }
        };
        
        const houses = await addresses.find({
            $and: [
                { street },
                geoFilter
            ]
        })
            .sort({ housenumber_int: 1 }) // wymaga pola housenumber_int
            .toArray();

        res.json(houses.map(h => ({
            housenumber: h.housenumber,
            city: h.city,
            postcode: h.postcode,
            location: h.location
        })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

export default router;
