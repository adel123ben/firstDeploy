const mongoose = require('mongoose');

const orderLineSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
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

const OrderLine = mongoose.model('OrderLine', orderLineSchema);
module.exports = OrderLine