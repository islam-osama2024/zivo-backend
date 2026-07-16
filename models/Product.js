const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
    },
    description: {
      type: String,
      required: [true, 'وصف المنتج مطلوب'],
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'عام',
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
