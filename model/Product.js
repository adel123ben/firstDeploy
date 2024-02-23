const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
      type: String,
      required: true  
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    tags: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: false
    }
}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema);
module.exports = Product;