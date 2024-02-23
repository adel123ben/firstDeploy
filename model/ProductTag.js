const mongoose = require('mongoose');

const productTagSchema = new mongoose.Schema({

    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
}, {
    timestamps: true
});

const ProductTag = mongoose.model('ProductTag', productTagSchema);
module.exports = ProductTag