const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/naprzystanek', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const ztmRoutes = require('./routes/ztm');
app.use('/api/ztm', ztmRoutes);

app.get('/', (req, res) => {
  res.send('NaPrzystanek Backend API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
