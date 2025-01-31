const nodemailer = require("nodemailer");
const express = require('express');
const app = express();

app.use(express.json());

// Show Data
const shows = {
    "show_20241015_1": { time: "07:00 AM", seats: 100, bookings: [] },
    "show_20241015_2": { time: "10:00 AM", seats: 50, bookings: [] },
};

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    service: "gmail", // or use 'hotmail', 'yahoo', etc.
    auth: {
        user: "your-email@gmail.com", // Your email
        pass: "your-email-password", // Your email password (use App Passwords for Gmail)
    },
});

// Booking Endpoint
app.post('/api/book', async (req, res) => {
    const { showId, name, email, phoneNumber, seats } = req.body;

    if (!shows[showId]) {
        return res.status(404).send({ message: "Show not found" });
    }

    if (shows[showId].seats < seats) {
        return res.status(400).send({ message: "Not enough seats available" });
    }

    // Deduct seats and save booking
    shows[showId].seats -= seats;
    shows[showId].bookings.push({ name, email, phoneNumber, seats });

    // Email content
    const ticketDetails = `
        <h2>Your Booking Confirmation</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Show Time:</strong> ${shows[showId].time}</p>
        <p><strong>Seats:</strong> ${seats}</p>
        <p><strong>Show ID:</strong> ${showId}</p>
        <p>Thank you for booking with us!</p>
    `;

    // Send email
    try {
        await transporter.sendMail({
            from: '"Movie Ticket System" <your-email@gmail.com>',
            to: email,
            subject: "Your Ticket Booking Confirmation",
            html: ticketDetails,
        });

        res.status(200).send({ message: "Booking successful! Ticket sent to email.", show: shows[showId] });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Booking successful, but email sending failed." });
    }
});

app.listen(8976, () => console.log("Server running on http://localhost:8976"));
