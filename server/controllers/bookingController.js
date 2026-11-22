
const Booking = require('../models/Bookings');
const Event = require('../models/Events');
const OTP = require('../models/OTP');
const { randomInt } = require('crypto');

const { sendOTPEmail, sendBookingEmail } = require('../utils/emails');

// Generate a secure 6-digit OTP
const generateOTP = () => {
    return randomInt(100000, 1000000).toString();
};

// Send OTP for event booking
exports.sendBookingOTP = async (req, res) => {
    try {
        const email = req.user.email;

        if (!email) {
            return res.status(400).json({
                message: 'User email not found'
            });
        }

        const otp = generateOTP();

        // Remove previous booking OTP
        await OTP.findOneAndDelete({
            email,
            action: 'event_booking'
        });

        // Save new OTP (expires after 5 minutes)
        await OTP.create({
            email,
            otp,
            action: 'event_booking'
        });

        await sendOTPEmail(email, otp, 'event_booking');

        res.json({
            message: 'OTP sent successfully'
        });

    } catch (error) {
        console.error('Send booking OTP error:', error);

        res.status(500).json({
            message: 'Failed to send booking OTP'
        });
    }
};


// Create a new event booking
exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        if (!eventId || !otp) {
            return res.status(400).json({
                message: 'Event ID and OTP are required'
            });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({
            email: req.user.email,
            action: 'event_booking'
        });

        if (!otpRecord || otpRecord.otp !== String(otp)) {
            return res.status(400).json({
                message: 'Invalid or expired OTP'
            });
        }

        // Find event
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({
                message: 'No available seats for this event'
            });
        }

        // Check for an existing pending or confirmed booking
        const existingBooking = await Booking.findOne({
            userId: req.user._id,
            eventId,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                message: 'You have already booked this event'
            });
        }

        // Create booking
        const booking = await Booking.create({
            userId: req.user._id,
            eventId,
            amount: event.ticketPrice,
            status: 'pending',
            paymentStatus: 'not paid'
        });

        // Delete OTP after successful booking
        await OTP.deleteMany({
            email: req.user.email,
            action: 'event_booking'
        });

        // Send booking email using the existing emails.js structure
        await sendBookingEmail(req.user.email, {
            event: event.title,
            date: new Date(event.date).toLocaleDateString(),
            time: new Date(event.date).toLocaleTimeString(),
            location: event.location
        });

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: booking._id
        });

    } catch (error) {
        console.error('Book event error:', error);

        res.status(500).json({
            message: 'Failed to create booking'
        });
    }
};


// Confirm an event booking (Admin)
exports.confirmBooking = async (req, res) => {
    try {
        let { paymentStatus } = req.body;

        // Default payment status
        paymentStatus = paymentStatus || 'not paid';

        if (!['paid', 'not paid'].includes(paymentStatus)) {
            return res.status(400).json({
                message: 'Invalid payment status'
            });
        }

        // Find booking and populate user details
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'email');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({
                message: 'Booking is already confirmed'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'Cancelled booking cannot be confirmed'
            });
        }

        // Atomically change pending booking to confirmed.
        // This prevents duplicate confirmation requests.
        const confirmedBooking = await Booking.findOneAndUpdate(
            {
                _id: booking._id,
                status: 'pending'
            },
            {
                $set: {
                    status: 'confirmed',
                    paymentStatus
                }
            },
            { new: true }
        );

        if (!confirmedBooking) {
            return res.status(400).json({
                message: 'Booking is no longer pending'
            });
        }

        // Atomically decrease available seats
        const event = await Event.findOneAndUpdate(
            {
                _id: booking.eventId,
                availableSeats: { $gt: 0 }
            },
            {
                $inc: { availableSeats: -1 }
            },
            { new: true }
        );

        // If no seats are available, restore booking status
        if (!event) {
            await Booking.findByIdAndUpdate(booking._id, {
                $set: {
                    status: 'pending',
                    paymentStatus: 'not paid'
                }
            });

            return res.status(400).json({
                message: 'No available seats for this event'
            });
        }

        // Send confirmation email to the actual booking user
        if (booking.userId && booking.userId.email) {
            await sendBookingEmail(booking.userId.email, {
                event: event.title,
                date: new Date(event.date).toLocaleDateString(),
                time: new Date(event.date).toLocaleTimeString(),
                location: event.location
            });
        }

        res.json({
            message: 'Booking confirmed successfully',
            bookingId: confirmedBooking._id
        });

    } catch (error) {
        console.error('Confirm booking error:', error);

        res.status(500).json({
            message: 'Failed to confirm booking'
        });
    }
};


// Get bookings of logged-in user
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.user._id
        }).populate('eventId');

        res.json(bookings);

    } catch (error) {
        console.error('Get my bookings error:', error);

        res.status(500).json({
            message: 'Failed to fetch bookings'
        });
    }
};


// Cancel an event booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        // Check booking ownership
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to cancel this booking'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'Booking is already cancelled'
            });
        }

        const previousStatus = booking.status;

        // Update only if booking has not already been cancelled
        const cancelledBooking = await Booking.findOneAndUpdate(
            {
                _id: booking._id,
                status: { $in: ['pending', 'confirmed'] }
            },
            {
                $set: { status: 'cancelled' }
            },
            { new: true }
        );

        if (!cancelledBooking) {
            return res.status(400).json({
                message: 'Booking cannot be cancelled'
            });
        }

        // Release the seat only for confirmed bookings
        if (previousStatus === 'confirmed') {
            await Event.findByIdAndUpdate(
                booking.eventId,
                {
                    $inc: { availableSeats: 1 }
                }
            );
        }

        // Keep cancelled booking in database for booking history
        res.json({
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel booking error:', error);

        res.status(500).json({
            message: 'Failed to cancel booking'
        });
    }
};
