const User = require("../models/Users");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/emails");


const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const newUser = await User.create({ name, email, password: hashedPassword, role: 'user', isVerified: false });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await OTP.create({ email, otp, action: 'accountVerification' });
        await sendOTPEmail(email, otp, 'account_Verification');

        res.status(201).json({
             message: "User registered successfully. Please verify your email.", userId: newUser._id
            , email: newUser.email});
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified && user.role === 'user') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({ email, action: 'accountVerification' }); // Remove any existing OTPs for this email
        await OTP.create({ email, otp, action: 'accountVerification' });
        await sendOTPEmail(email, otp, 'account_Verification');
        return res.status(400).json({ message: "Account not verified. Please check your email for the OTP." });
    }

    res.json({
        message: "Login successful",
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        
    });
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp, action: 'accountVerification' });
    if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteMany({ email, action: 'accountVerification' }); // Remove the OTP after successful verification
    res.json({ message: "OTP verified successfully",
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)

     });
};
