const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Weather Data Dashboard API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
