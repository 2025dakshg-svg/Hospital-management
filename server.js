const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const connectDB = require("./config/db");
const cors=require('cors');

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors('*'));
app.use(express.json());

const User = require("./models/user");
const Hospital = require("./models/hospital");

app.use(
    session({
        secret: process.env.SESSION_SECRET || "hospital-secret",
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });

            if (!user) {
                return done(null, false, {
                    message: "Invalid username or password"
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return done(null, false, {
                    message: "Invalid username or password"
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Hospital Management API"
    });
});

app.post("/register", async (req, res) => {
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
                _id: user._id,
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

app.post(
    "/login",
    passport.authenticate("local"),
    (req, res) => {
        res.status(200).json({
            message: "Login successful",
            user: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email
            }
        });
    }
);

app.post("/logout", (req, res) => {
    req.logout((error) => {
        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        req.session.destroy(() => {
            res.status(200).json({
                message: "Logout successful"
            });
        });
    });
});

app.post("/hospitals", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const hospital = await Hospital.create(req.body);

        res.status(201).json({
            message: "Hospital created successfully",
            hospital
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to create hospital",
            error: error.message
        });
    }
});

app.get("/hospitals", async (req, res) => {
    try {
        const hospitals = await Hospital.find();

        res.status(200).json(hospitals);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch hospitals",
            error: error.message
        });
    }
});

app.get("/hospitals/available", async (req, res) => {
    try {
        const hospitals = await Hospital.find({
            availableBeds: { $gt: 0 }
        });

        res.status(200).json(hospitals);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch available hospitals",
            error: error.message
        });
    }
});

app.get("/hospitals/:id", async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        res.status(200).json(hospital);
    } catch (error) {
        res.status(400).json({
            message: "Invalid hospital ID"
        });
    }
});

app.put("/hospitals/:id", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        res.status(200).json({
            message: "Hospital updated successfully",
            hospital
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to update hospital",
            error: error.message
        });
    }
});

app.delete("/hospitals/:id", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const hospital = await Hospital.findByIdAndDelete(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        res.status(200).json({
            message: "Hospital deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid hospital ID"
        });
    }
});

connectDB(app);

