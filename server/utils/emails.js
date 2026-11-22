const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});


exports.sendBookingEmail = async (email, bookingDetails) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Booking Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #333;">Booking Confirmation</h2>
                    <p style="font-size: 16px; color: #555;">Thank you for your booking!</p>
                    <p style="font-size: 14px; color: #999;">Booking Details:</p>
                    <ul style="list-style-type: none; padding: 0;">
                        <li style="margin-bottom: 10px;"><strong>Event:</strong> ${bookingDetails.event}</li>
                        <li style="margin-bottom: 10px;"><strong>Date:</strong> ${bookingDetails.date}</li>
                        <li style="margin-bottom: 10px;"><strong>Time:</strong> ${bookingDetails.time}</li>
                        <li style="margin-bottom: 10px;"><strong>Location:</strong> ${bookingDetails.location}</li>
                    </ul>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Booking email sent successfully');
    } catch (error) {
        console.error('Error sending booking email:', error);
    }
};

exports.sendOTPEmail = async (email, otp, type) => {
    try {
        const title = type === 'account_Verification' ? 'Verify your Eventora Account' : 'Event Booking';
        const message = type === 'account_Verification' ? 
        `Your OTP code for account verification is: ${otp}. It will expire in 5 minutes.` : `Your OTP code for event booking is: ${otp}. It will expire in 5 minutes.`;
        
        
        
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: title,
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #333;">${title}</h2>
                <p style="font-size: 16px; color: #555;">${message}</p>
                <div style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #000;">
                    ${otp}
                    <p style="font-size: 14px; color: #999;">If you did not request this, please ignore this email.</p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
} catch (error) {
    console.error('Error sending OTP email:', error);

}
};
