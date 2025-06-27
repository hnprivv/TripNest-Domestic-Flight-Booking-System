// models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true, // Flight numbers should be unique
        trim: true
    },
    airline: {
        type: String,
        required: true,
        trim: true
    },
    departureAirport: {
        type: String,
        required: true,
        trim: true
    },
    arrivalAirport: {
        type: String,
        required: true,
        trim: true
    },
    departureTime: {
        type: Date, // Store as Date objects for easy manipulation and querying
        required: true
    },
    arrivalTime: {
        type: Date, // Store as Date objects
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0 // Price cannot be negative
    },
    availableSeats: {
        type: Number,
        required: true,
        min: 0 // Seats cannot be negative
    },
    // You can add more fields later, like duration, class types, etc.
});

// Add a pre-save hook to ensure arrivalTime is after departureTime if needed
flightSchema.pre('save', function (next) {
    if (this.departureTime && this.arrivalTime && this.arrivalTime <= this.departureTime) {
        next(new Error('Arrival time must be after departure time.'));
    } else {
        next();
    }
});


const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;