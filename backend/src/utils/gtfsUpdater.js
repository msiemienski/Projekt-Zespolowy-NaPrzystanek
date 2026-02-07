import axios from 'axios';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GTFS_URL = 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/30e783e4-2bec-4a7d-bb22-ee3e3b26ca96/download/gtfsgoogle.zip';
const TARGET_DIR = path.resolve(__dirname, '../../otp/ztm');
const ZIP_PATH = path.join(TARGET_DIR, 'gtfs.zip');

export async function updateGTFS() {
    try {
        const czasStartu = new Date().toISOString();
        console.log(`[GTFS] Rozpoczynanie aktualizacji: ${czasStartu}`);

        if (!fs.existsSync(TARGET_DIR)) {
            fs.mkdirSync(TARGET_DIR, { recursive: true });
        }

        const response = await axios({
            method: 'get',
            url: GTFS_URL,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(ZIP_PATH);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const statZip = fs.statSync(ZIP_PATH);
        console.log(`[GTFS] Pobrano ZIP: ${statZip.size} bajtów`);

        const zip = new AdmZip(ZIP_PATH);
        zip.extractAllTo(TARGET_DIR, true);

        const teraz = new Date();
        const pliki = fs.readdirSync(TARGET_DIR);
        for (const plik of pliki) {
            const sciezka = path.join(TARGET_DIR, plik);
            fs.utimesSync(sciezka, teraz, teraz);
        }

        console.log(`[GTFS] Pomyślnie zaktualizowano pliki w: ${TARGET_DIR} (Data: ${teraz.toLocaleString()})`);

    } catch (error) {
        console.error('[GTFS] Błąd podczas aktualizacji:', error.message);
        throw error;
    }
}
