const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: false,
        default: Date.now
    }
}, {
    timestamps: true
})

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog