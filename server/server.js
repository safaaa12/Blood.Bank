//SERVER.JS
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const bloodRoutes = require('./routes/blood');
const authRoutes = require('./routes/auth');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// שימוש ב-MongoDB URI מתוך קובץ .env

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('Failed to connect to MongoDB', err));
 app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();});
app.use('/api/blood', bloodRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});