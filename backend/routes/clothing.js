const express = require("express");
const Clothing = require("../models/Clothing");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Swap value calculator - simple weighted formula
const calculateSwapValue = ({ brand, condition, type }) => {
  const brandWeights = {
    premium: 1000, // Nike, Zara, H&M, Levis etc
    mid: 600,
    local: 300,
  };
  const conditionMultiplier = {
    "New": 1.2,
    "Like New": 1.0,
    "Good": 0.75,
    "Fair": 0.5,
  };

  const premiumBrands = ["nike", "adidas", "zara", "levis", "h&m", "puma"];
  const brandTier = premiumBrands.includes((brand || "").toLowerCase())
    ? "premium"
    : "mid";

  const base = brandWeights[brandTier] || brandWeights.mid;
  const multiplier = conditionMultiplier[condition] || 0.75;

  return Math.round(base * multiplier);
};

// Create listing
router.post("/", protect, async (req, res) => {
  try {
    const { title, type, brand, size, condition, description, images, location } = req.body;

    const estimatedValue = calculateSwapValue({ brand, condition, type });

    const item = await Clothing.create({
      owner: req.user.id,
      title,
      type,
      brand,
      size,
      condition,
      description,
      images,
      location,
      estimatedValue,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Browse / filter listings (category + location + search)
router.get("/", async (req, res) => {
  try {
    const { type, location, search, minValue, maxValue } = req.query;
    const filter = { status: "available" };

    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (search) filter.title = { $regex: search, $options: "i" };
    if (minValue || maxValue) {
      filter.estimatedValue = {};
      if (minValue) filter.estimatedValue.$gte = Number(minValue);
      if (maxValue) filter.estimatedValue.$lte = Number(maxValue);
    }

    const items = await Clothing.find(filter)
      .populate("owner", "name location")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get single item detail
router.get("/:id", async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id).populate("owner", "name location phone");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get my listings
router.get("/user/mine", protect, async (req, res) => {
  try {
    const items = await Clothing.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Edit listing
router.put("/:id", protect, async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this item" });
    }

    Object.assign(item, req.body);
    if (req.body.brand || req.body.condition || req.body.type) {
      item.estimatedValue = calculateSwapValue({
        brand: req.body.brand || item.brand,
        condition: req.body.condition || item.condition,
        type: req.body.type || item.type,
      });
    }
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete listing
router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }
    await item.deleteOne();
    res.json({ message: "Listing removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
