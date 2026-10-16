const mongoose = require("mongoose");

const clothingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, required: true }, // e.g. Shirt, Jeans, Jacket
    brand: { type: String, required: true },
    size: { type: String, required: true },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair"],
      required: true,
    },
    description: { type: String },
    images: [{ type: String }], // image URLs
    estimatedValue: { type: Number, required: true }, // calculated swap value
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "pending", "swapped"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Clothing", clothingSchema);
