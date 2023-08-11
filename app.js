// app.js

const express = require('express');
const app = express();
const port = 3000;

const sequelize = require('./db');
const Product = require('./models/product');

// Inisialisasi dan sinkronkan model dengan database
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Koneksi ke database berhasil.');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error);
  }
})();

// Middleware untuk parsing body dari permintaan HTTP
app.use(express.json());

// Rute API untuk mendapatkan semua produk
app.get('/api/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// Rute API untuk mendapatkan produk berdasarkan ID
app.get('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await Product.findByPk(id);

  if (!product) {
    res.status(404).json({ message: 'Produk tidak ditemukan' });
  } else {
    res.json(product);
  }
});

// Rute API untuk menambahkan produk baru
app.post('/api/products', async (req, res) => {
  const { name } = req.body;
  try {
    const newProduct = await Product.create({ name });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan produk' });
  }
});

// Jalankan server pada port yang ditentukan
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
