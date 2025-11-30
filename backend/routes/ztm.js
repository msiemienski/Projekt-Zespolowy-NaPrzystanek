const express = require('express');
const router = express.Router();
const axios = require('axios');
const Display = require('../models/Display');

const ZTM_DISPLAYS_URL = 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/ee910ad8-8ffa-4e24-8ef9-d5a335b07ccb/download/displays.json';

// Fetch displays from ZTM API and save to DB
router.get('/fetch-displays', async (req, res) => {
  try {
    console.log('Fetching displays from ZTM API...');
    const response = await axios.get(ZTM_DISPLAYS_URL);
    const data = response.data;
    
    const displays = data.displays || data; 

    if (!Array.isArray(displays)) {
        console.error('Unexpected data format:', data);
        return res.status(500).json({ msg: 'Unexpected data format from ZTM API' });
    }

    console.log(`Fetched ${displays.length} displays. Saving to DB...`);

    let count = 0;
    for (const item of displays) {
      await Display.findOneAndUpdate(
        { displayCode: item.displayCode },
        item,
        { upsert: true, new: true }
      );
      count++;
    }

    res.json({ msg: 'Displays fetched and saved successfully', count });
  } catch (err) {
    console.error('Error fetching displays:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

router.get('/displays', async (req, res) => {
  try {
    const displays = await Display.find();
    res.json(displays);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
