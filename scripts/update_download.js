
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

//Get date (yesterday)
const date = dayjs().subtract(1, 'day').format('MM_DD_YYYY');


//Media types and file prefixes
const files = [
    'movie_ids',
    'tv_series_ids',
    'person_ids',
    'collection_ids',
    'tv_network_ids',
    'keyword_ids',
    'production_company_ids'
];

//Base URL
const baseURL = 'http://files.tmdb.org/p/exports';

//Create downloads folder
const downloadDir = path.join(__dirname, 'downloads');
if(!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

async function downloadFile(filePrefix) {
    const fileName = `${filePrefix}_${date}.json.gz`;
    const url = `${baseURL}/${fileName}`;
    const filePath = path.join(downloadDir, fileName);

    console.log(filePath)

    console.log(`Downloading ${url}...`);
    try {
        const response = await axios.get(url, {responseType: 'stream'});
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Saved: ${filePath}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch(err) {
        console.error(`Failed to download ${filePrefix}: `, err.response?.status || err.message);
    }
}

async function main() {
    for (const file of files) {
        await downloadFile(file);
    }
}

main();