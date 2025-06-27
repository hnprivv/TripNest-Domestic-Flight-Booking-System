# ✈️ TripNest – Flight Booking Web App

TripNest is a full-stack web application that allows users to search, book, and receive alerts for flights. It includes a user-friendly frontend interface and a Node.js backend connected to a MongoDB database.


## 🚀 Features

- User registration and login
- Search for flights by origin, destination, and date (not connected to backend for now / non functional)
- Receive price alerts for selected routes (not connected to backend for now)
- Contact form for user queries
- Admin panel for managing flights and airlines


## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (served via the `public` folder)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Email Service**: Configured via utility in `/utils`


## 📁 Project Structure

TripNest-Domestic-Flight-Booking-System-main/

├── models/               # Mongoose models for database schemas

├── utils/                # Email service configuration

├── public/               # Frontend files (HTML, CSS, JS)

└── server.js             # Main backend entry point

"TripNest-Domestic-Flight-Booking-System-main" folder will be created automatically when downloading from GitHub.


## 🧑‍💻 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repo_url>
cd TripNest-Domestic-Flight-Booking-System-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file inside `TripNest-Domestic-Flight-Booking-System-main/` with the following:

```
PORT=5000
MONGODB_URI=<your_mongo_connection_string>
FROM_EMAIL=<your_email>
FROM_PASSWORD=<your_password>
```

### 4. Run the Server

```bash
node server.js
```

Visit: `http://localhost:5000`


## 📬 Contact Form

Submissions from users are stored using `ContactSubmission.js` and confirmation is emailed to the user through the configured service.


## 📦 Models Summary

- `User.js` – User registration and login
- `Flight.js` – Flight information storage
- `Airline.js` – Airline details
- `PriceAlert.js` – Tracks alerts for specific routes
- `ContactSubmission.js` – Stores user queries and messages


## 👥 Authors

- Huzaifa Najam
- M. Rayyan Ayub
- Mubashir Saleem


## 📄 License

This is a semester-end project, and currently not under a specific license.
