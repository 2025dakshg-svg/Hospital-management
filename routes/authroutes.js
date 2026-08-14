const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

router.post(
    "/login",
    passport.authenticate("local"),
    (req, res) => {
        res.status(200).json({
            message: "Login successful",
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email
            }
        });
    }
);

router.post("/logout", (req, res) => {
    req.logout((error) => {
        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.status(200).json({
            message: "Logout successful"
        });
    });
});

module.exports = router;