const express = require("express");
const Hospital = require("../models/hospital");

const router = express.Router();

router.post("/", async (req, res) => {
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

router.get("/", async (req, res) => {
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

router.get("/available", async (req, res) => {
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

router.get("/:id", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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

module.exports = router;