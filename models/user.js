const mongoose = require("mongoose");
const Counter = require("./counter");

const userSchema = new mongoose.Schema(
    {
        _id: Number,
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "userId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = counter.seq;
    }
});

module.exports = mongoose.model("User", userSchema);
