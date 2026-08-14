const mongoose = require("mongoose");
const Counter = require("./counter");

const hospitalSchema = new mongoose.Schema(
    {
        _id: Number,
        name: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        totalBeds: {
            type: Number,
            required: true,
            min: 0
        },
        availableBeds: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

hospitalSchema.pre("save", async function () {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "hospitalId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
});

module.exports = mongoose.model("Hospital", hospitalSchema);
