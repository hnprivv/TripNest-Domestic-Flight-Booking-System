// models/Airline.js
const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
    airlineName: {
        type: String,
        required: true,
        unique: true, // Airline names should be unique
        trim: true
    },
    iataCode: {
        type: String,
        required: true,
        unique: true, // IATA codes should be unique
        trim: true,
        uppercase: true,
        minlength: 2,
        maxlength: 2 // IATA codes are typically 2 characters
    },
    country: {
        type: String,
        required: true,
        trim: true
    }
});

const Airline = mongoose.model('Airline', airlineSchema);

module.exports = Airline;