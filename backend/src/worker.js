const Queue = require('bull');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { pool } = require('./db');

const fileQueue = new Queue('file-processing', process.env.REDIS_URL);

fileQueue.process(async (job, done) => {
    const filePath = job.data.filePath;
    const batchData = [];
    const batchSize = 500; // Insert 500 records at a time

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            batchData.push([
                row.date,
                row.location,
                row.temperature,
                row.humidity,
                row.precipitation,
                row.wind_speed,
            ]);

            if (batchData.length === batchSize) {
                pool.query(
                    `INSERT INTO weather_data (date, location, temperature, humidity, precipitation, wind_speed)
                    VALUES ${batchData.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
                    `,
                    batchData.flat()
                );
                batchData.length = 0;
            }
        })
        .on('end', () => {
            if (batchData.length > 0) {
                pool.query(
                    `INSERT INTO weather_data (date, location, temperature, humidity, precipitation, wind_speed)
                    VALUES ${batchData.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
                    `,
                    batchData.flat()
                );
            }
            done();
        });
});

module.exports = { fileQueue };
