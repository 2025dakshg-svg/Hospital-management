const mongoose = require("mongoose");

function connectDB(app) {
    return mongoose
        .connect(process.env.MONGO_URI, { dbName: "hospital_management" })
        .then(() => {
            console.log("MongoDB connected successfully");

            const PORT = process.env.PORT || 5000;

            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error("MongoDB connection failed:", error.message);
            process.exit(1);
        });
}

module.exports = connectDB;
