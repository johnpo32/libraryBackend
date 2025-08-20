const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Aquí debe ir el hash
    role: { type: String, default: "user" }
});

module.exports = mongoose.model("User", UserSchema);
