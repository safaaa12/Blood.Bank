require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const bloodRoutes = require('./routes/blood');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// שימוש ב-MongoDB URI מתוך קובץ .env
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use('/api', bloodRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});
