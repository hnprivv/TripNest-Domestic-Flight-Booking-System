require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const sendEmail = require('./utils/email'); // Import the email utility
const Flight = require('./models/Flight'); // Import the Flight model
const Airline = require('./models/Airline'); // Import the Airline model
const ContactSubmission = require('./models/ContactSubmission'); // Import the ContactSubmission model
const PriceAlert = require('./models/PriceAlert'); // Import the PriceAlert model

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// --- Basic Route (for testing) ---
app.get('/', (req, res) => {
    res.send('TripNest Backend is running!');
});

// --- User Registration Route ---
app.post('/api/signup', async (req, res) => {
    const { name, email, phone, password, confirm_password } = req.body;

    // --- Server-side Validation ---
    if (!name || !email || !password || !confirm_password) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (phone && !/^\+?[0-9\s-()]{7,20}$/.test(phone)) {
        return res.status(400).json({ message: 'Please enter a valid phone number.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        user = new User({
            name,
            email,
            phone: phone || '',
            password
        });

        await user.save();

        // --- Send Confirmation Email ---
        try {
            const emailSubject = 'Welcome to TripNest! Your Account is Ready!';
            const emailHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to TripNest!</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            background-color: #ffffff;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background-color: #6a5742; /* TripNest brand color */
                            color: white;
                            padding: 15px 20px;
                            border-radius: 8px 8px 0 0;
                            text-align: center;
                        }
                        .header img {
                            max-width: 120px; /* Adjust logo size as needed */
                            height: auto;
                            margin-bottom: 10px;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                        }
                        .content {
                            padding: 20px;
                        }
                        .content p {
                            margin: 0 0 15px 0;
                        }
                        .highlight {
                            background-color: #e6f7ff; /* Light blue for highlights */
                            padding: 10px;
                            border-left: 5px solid #2196f3;
                            margin-bottom: 15px;
                        }
                        .button-container {
                            text-align: center;
                            margin-top: 25px;
                            margin-bottom: 20px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 25px;
                            background-color: #6a5742; 
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                        }
                        .button a {
                            color: white; /* Ensure the text inside the link is also white */
                            text-decoration: none; /* Remove underline if any default 'a' tag rule adds it */
                        }
                        .footer {
                            text-align: center;
                            font-size: 0.8em;
                            color: #777;
                            margin-top: 25px;
                            padding-top: 15px;
                            border-top: 1px solid #eee;
                        }
                        .footer a {
                            color: #6a5742;
                            text-decoration: none;
                        }
                        .footer a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://i.imghippo.com/files/eUm5354jQI.png" alt="TripNest Logo">
                            <h1>Welcome to TripNest!</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${name}</strong>,</p> <p>Thank you for signing up and becoming a part of the TripNest family!</p>
                            <p>Your account has been successfully created. We're thrilled to have you on board and help you find the best flights for your next adventure.</p>

                            <div class="highlight">
                                <p><strong>Your TripNest Account Details:</strong></p>
                                <p><strong>Email:</strong> ${email}</p> <p>You can now log in to explore countless flight options, manage your bookings, and set up price alerts.</p>
                            </div>

                            <div class="button-container">
                                <span class="button">Log In to Your Account</span> </div>

                            <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                            <p>Happy travels!</p>
                            <p>Sincerely,<br>The TripNest Team</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} TRIPNEST. All rights reserved.</p> <p>
                                <a href="http://localhost:${process.env.PORT || 5000}/privacy-policy.html">Privacy Policy</a> |
                                <a href="http://localhost:${process.env.PORT || 5000}/terms-of-service.html">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await sendEmail({
                email: user.email,
                subject: emailSubject,
                html: emailHtml
            });
            console.log('Confirmation email sent to:', user.email);

        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            return res.status(500).json({ message: 'User registered, but failed to send confirmation email. Please try again later.' });
        }

        res.status(201).json({ message: 'User registered successfully! A confirmation email has been sent.' });

    } catch (error) {
        console.error('Error during user registration:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Server error during registration. Please try again.' });
    }
});

// User Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            // User not found
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 2. Compare provided password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Passwords do not match
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 3. Login successful
        console.log(`User '${email}' logged in successfully.`);

        res.status(200).json({
            message: 'Login Successful!',
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login. Please try again later.' });
    }
});

// Admin Login Route
app.post('/api/admin_login', async (req, res) => {
    const { email, password } = req.body; // No redirectTo needed for admin login, typically fixed admin dashboard

    // Basic input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            // User not found
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 2. Compare provided password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Passwords do not match
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 3. IMPORTANT: Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access Denied: Not an admin account.' });
        }

        // 4. Admin Login successful

        if (user.isAdmin == true) {
            console.log(`Admin '${email}' logged in successfully.`);
        }

        res.status(200).json({
            message: 'Admin Login Successful!',
            user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
            redirectTo: 'admin_dashboard.html'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during admin login. Please try again.' });
    }
});

// --- Flight Search Route ---
// Route to Add a New Flight (POST /api/flights)
app.post('/api/flights', async (req, res) => {
    try {
        const {
            flightNumber,
            airline,
            departureAirport,
            arrivalAirport,
            departureTime,
            arrivalTime,
            price,
            availableSeats
        } = req.body;

        // Basic validation
        if (!flightNumber || !airline || !departureAirport || !arrivalAirport ||
            !departureTime || !arrivalTime || price === undefined || availableSeats === undefined) {
            return res.status(400).json({ message: 'All flight fields are required.' });
        }

        // Check for existing flight number to maintain uniqueness
        const existingFlight = await Flight.findOne({ flightNumber });
        if (existingFlight) {
            return res.status(409).json({ message: 'Flight with this number already exists.' });
        }

        // Create new flight instance
        const newFlight = new Flight({
            flightNumber,
            airline,
            departureAirport,
            arrivalAirport,
            departureTime,
            arrivalTime,
            price,
            availableSeats
        });

        // Save the flight to the database
        await newFlight.save();

        res.status(201).json({ message: 'Flight added successfully!', flight: newFlight });

    } catch (error) {
        console.error('Error adding flight:', error);
        // Handle validation errors (e.g., from pre-save hook or schema types)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error when adding flight.' });
    }
});

// Route to Get All Flights (GET /api/flights)
app.get('/api/flights', async (req, res) => {
    try {
        const { from, to, date } = req.query;
        let query = {};

        // Build query based on provided parameters
        if (from) {
            query.departureAirport = new RegExp(from, 'i'); // Case-insensitive match for departure airport
        }
        if (to) {
            query.arrivalAirport = new RegExp(to, 'i'); // Case-insensitive match for arrival airport
        }
        if (date) {
            // Convert date string (e.g., "YYYY-MM-DD") to a date range for MongoDB query
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999); // End of the day in UTC

            query.departureTime = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // Find flights based on the constructed query, sorted by departure time
        const flights = await Flight.find(query).sort({ departureTime: 1 });
        res.status(200).json(flights); // Send found flights as JSON response
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ message: 'Failed to fetch flights. Please try again later.' });
    }
});

// --- Airline Search Route ---
// Route to Add a New Airline (POST /api/airlines)
app.post('/api/airlines', async (req, res) => {
    try {
        const { airlineName, iataCode, country } = req.body;

        // Basic validation
        if (!airlineName || !iataCode || !country) {
            return res.status(400).json({ message: 'All airline fields are required.' });
        }

        // Check for existing airline name or IATA code to maintain uniqueness
        const existingAirlineByName = await Airline.findOne({ airlineName });
        if (existingAirlineByName) {
            return res.status(409).json({ message: 'Airline with this name already exists.' });
        }

        const existingAirlineByIata = await Airline.findOne({ iataCode: iataCode.toUpperCase() });
        if (existingAirlineByIata) {
            return res.status(409).json({ message: 'Airline with this IATA code already exists.' });
        }

        // Create new airline instance
        const newAirline = new Airline({
            airlineName,
            iataCode: iataCode.toUpperCase(), // Ensure IATA code is stored in uppercase
            country
        });

        // Save the airline to the database
        await newAirline.save();

        res.status(201).json({ message: 'Airline added successfully!', airline: newAirline });

    } catch (error) {
        console.error('Error adding airline:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error when adding airline.' });
    }
});

// Route to Get All Airlines (GET /api/airlines)
app.get('/api/airlines', async (req, res) => {
    try {
        const airlines = await Airline.find({}); // Find all airlines in the database
        res.status(200).json(airlines); // Send them as a JSON array

    } catch (error) {
        console.error('Error fetching airlines:', error);
        res.status(500).json({ message: 'Server error when fetching airlines.' });
    }
});

// --- User Search Route ---
// Route to Get All Users (GET /api/users)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Fetch all users, excluding the password field
        res.status(200).json(users); // Send them as a JSON array

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error when fetching users.' });
    }
});

// --- Contact Form Submission Route ---
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic server-side validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All form fields are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    try {
        // Create a new contact submission document
        const newSubmission = new ContactSubmission({
            name,
            email,
            subject,
            message
        });

        // Save the submission to the database
        await newSubmission.save();

        console.log(`Received and saved contact form message from ${email}`);

        // 2. Send confirmation email to the user
        const userConfirmationHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>TripNest Contact Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
                    .header { background-color: #6a5742; color: white; padding: 10px 20px; border-radius: 8px 8px 0 0; text-align: center; }
                    .header table { width: 100%; border-collapse: collapse; }
                    .header td { padding: 0; vertical-align: middle; text-align: center; }
                    .content { padding: 20px; }
                    .footer { text-align: center; font-size: 0.8em; color: #777; margin-top: 20px; }
                    p { margin: 0 0 10px 0; }
                    strong { color: #291f13; }
                    .logo-img { max-width: 100px; margin-bottom: 10px; } /* Style for logo */
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://i.imghippo.com/files/eUm5354jQI.png" alt="TripNest Logo" class="logo-img">
                    </div>
                    <div class="content">
                        <p>Dear ${name},</p>
                        <p>We have successfully received your message and appreciate you reaching out to us.</p>
                        <p><strong>Your Submitted Details:</strong></p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Your Message:</strong></p>
                        <p style="white-space: pre-wrap; background-color: #eee; padding: 10px; border-radius: 5px;">${message}</p>
                        <p>We will review your inquiry and get back to you as soon as possible.</p>
                        <p>Sincerely,<br>The TripNest Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TRIPNEST. All rights reserved.</p>
                        <p><a href="http://localhost:${PORT}/privacy-policy.html">Privacy Policy</a> | <a href="http://localhost:${PORT}/terms-of-service.html">Terms of Service</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail({
            email: email, // Send to the user's email
            subject: `Confirmation: Your TripNest Message - ${subject}`,
            html: userConfirmationHtml
        });
        console.log(`Confirmation email sent to ${email}`);

        res.status(200).json({ message: 'Your message has been received successfully!' });

    } catch (error) {
        console.error('Error processing and saving contact form:', error);
        // Check for Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Failed to process and save your message. Please try again later.' });
    }
});

// --- Price Alert Submission Route ---
app.post('/api/price-alerts', async (req, res) => {
    const { email, targetPrice, frequency } = req.body;

    // Server-side validation
    if (!email) {
        return res.status(400).json({ message: 'Email is required for setting a price alert.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (targetPrice !== undefined && targetPrice !== null && targetPrice < 0) {
        return res.status(400).json({ message: 'Target price cannot be negative.' });
    }
    const validFrequencies = ['any-drop', 'daily', 'weekly'];
    if (frequency && !validFrequencies.includes(frequency)) {
        return res.status(400).json({ message: 'Invalid frequency selected.' });
    }

    try {
        // Create a new price alert document
        const newPriceAlert = new PriceAlert({
            email,
            targetPrice: targetPrice || null, // Store null if not provided
            frequency: frequency || 'any-drop' // Default to 'any-drop' if not provided
        });

        // Save the price alert to the database
        await newPriceAlert.save();
        console.log(`New price alert saved for email: ${email}`);

        // Send confirmation email to the user
        const emailSubject = 'TripNest: Price Alert Confirmation';
        const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>TripNest Price Alert Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
                    .header { background-color: #6a5742; color: white; padding: 10px 20px; border-radius: 8px 8px 0 0; text-align: center; }
                    .header img { max-width: 100px; margin-bottom: 10px; }
                    .content { padding: 20px; }
                    .footer { text-align: center; font-size: 0.8em; color: #777; margin-top: 20px; }
                    p { margin: 0 0 10px 0; }
                    strong { color: #291f13; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://i.imghippo.com/files/eUm5354jQI.png" alt="TripNest Logo">
                    </div>
                    <div class="content">
                        <p>Dear Valued Traveler,</p>
                        <p>This email confirms that your price alert for flights has been successfully set up with TripNest.</p>
                        <p><strong>Your Alert Details:</strong></p>
                        <ul>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Target Price:</strong> ${targetPrice ? `PKR ${new Intl.NumberFormat('en-PK').format(targetPrice)}` : 'Any price drop'}</li>
                            <li><strong>Frequency:</strong> ${frequency === 'any-drop' ? 'Notify on any drop' : frequency === 'daily' ? 'Daily updates' : 'Weekly updates'}</li>
                        </ul>
                        <p>We will notify you at this email address when the flight prices match your criteria.</p>
                        <p>Thank you for using TripNest!</p>
                        <p>Sincerely,<br>The TripNest Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} TRIPNEST. All rights reserved.</p>
                        <p><a href="http://localhost:${process.env.PORT || 5000}/privacy-policy.html">Privacy Policy</a> | <a href="http://localhost:${process.env.PORT || 5000}/terms-of-service.html">Terms of Service</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail({
            email: email,
            subject: emailSubject,
            html: emailHtml
        });
        console.log('Price alert confirmation email sent to:', email);

        res.status(201).json({ message: 'Price alert set successfully! A confirmation email has been sent.' });

    } catch (error) {
        console.error('Error setting price alert:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Failed to set price alert. Please try again later.' });
    }
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});