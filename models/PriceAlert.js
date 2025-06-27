// models/PriceAlert.js
const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required for price alert'],
        match: [/^[^s@]+@[^s@]+.[^s@]+$/, 'Please enter a valid email address.']
    },
    targetPrice: {
        type: Number,
        min: [0, 'Target price cannot be negative'],
        default: null // Optional: User might just want any drop
    },
    frequency: {
        type: String,
        enum: ['any-drop', 'daily', 'weekly'],
        default: 'any-drop'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PriceAlert', priceAlertSchema);