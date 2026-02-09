
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'backend_data.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Support large data payloads

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
}

// Basic root route to confirm server is running
app.get('/', (req, res) => {
    res.send('Kids Task Tracker API is running! 🚀 <br> Access data at <a href="/api/data">/api/data</a>');
});

// GET endpoint to retrieve all data
app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data file:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// POST endpoint to update specific keys
app.post('/api/data', (req, res) => {
    try {
        const newData = req.body; // Expect { key: value, key2: value2 }

        let currentData = {};
        if (fs.existsSync(DATA_FILE)) {
            currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }

        // Merge new data
        const updatedData = { ...currentData, ...newData };

        fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2));

        console.log(`Updated keys: ${Object.keys(newData).join(', ')}`);
        res.json({ success: true, keysUpdated: Object.keys(newData) });
    } catch (error) {
        console.error('Error writing data file:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
});
