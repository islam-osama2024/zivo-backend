require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Route اختبارية
app.get('/', (req, res) => {
  res.json({ message: 'API شغالة تمام 🚀' });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'حصل خطأ في السيرفر' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
