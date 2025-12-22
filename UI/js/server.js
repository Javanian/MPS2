const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());

// Konfigurasi koneksi PostgreSQL
const pool = new Pool({
  user: 'postgres',     //  user postgres
  host: 'localhost',    // host database
  database: 'postgres',   // nama database
  password: '@dminta9', // password postgres
  port: 5432,           // port default PostgreSQL
});


app.get('/sowkk', async (req, res) => {
  try {
    const { order } = req.query;
    const result = await pool.query(`SELECT * FROM sowkk WHERE "order" = $1
        ORDER BY "order" ASC, "activity" ASC`
        ,[order]
    ); 
        //  tabel
    res.json(result.rows); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi error saat ambil data' });
  }
});

app.get('/workcenterkk', async (req, res) => {
  try {
    const { order } = req.query;
    const result = await pool.query(`SELECT * FROM workcenterkk`
    ); 
        //  tabel
    res.json(result.rows); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi error saat ambil data' });
  }
});

app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
});
