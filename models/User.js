const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Full Name is required'],
        trim: true // Removes whitespace from both ends of a string
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensures email addresses are unique
        trim: true,
        lowercase: true, // Stores emails in lowercase
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'] // Basic email regex validation
    },
    phone: {
        type: String,
        trim: true,
        // Optional validation: if a phone number is provided, it must match the pattern
        validate: {
            validator: function (v) {
                if (v === null || v === '') return true; // Phone is optional
                return /^\+?[0-9\s-()]{7,20}$/.test(v); // Basic phone number regex
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'] // Minimum length validation
    },

    isAdmin: {
        type: Boolean,
        default: false // Default to false for regular users
    },
    verificationToken: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,

    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the creation date
    }
});

// --- Mongoose Middleware (Pre-save hook) ---
// This will run before a user document is saved to the database.
// We use it to hash the password before saving.
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt (random string)
        const salt = await bcrypt.genSalt(10); // 10 rounds is a good balance for security and performance
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Move to the next middleware or save operation
    } catch (err) {
        next(err); // Pass any error to the next middleware
    }
});

module.exports = mongoose.model('User', UserSchema);