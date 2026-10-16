const express = require("express");
const User = require("../models/User");
const Clothing = require("../models/Clothing");
const SwapRequest = require("../models/SwapRequest");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly);

// Get all users
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Block / unblock a user
router.put("/users/:id/block", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}` });
});

// Get all listings
router.get("/listings", async (req, res) => {
  const listings = await Clothing.find().populate("owner", "name email");
  res.json(listings);
});

// Remove a listing (inappropriate content)
router.delete("/listings/:id", async (req, res) => {
  const item = await Clothing.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Listing not found" });
  await item.deleteOne();
  res.json({ message: "Listing removed by admin" });
});

// Platform analytics / KPIs
router.get("/analytics", async (req, res) => {
  const totalListings = await Clothing.countDocuments();
  const totalUsers = await User.countDocuments();
  const successfulSwaps = await SwapRequest.countDocuments({ status: "completed" });
  const pendingSwaps = await SwapRequest.countDocuments({ status: "pending" });
  const totalSwapRequests = await SwapRequest.countDocuments();

  const conversionRate =
    totalSwapRequests > 0 ? ((successfulSwaps / totalSwapRequests) * 100).toFixed(1) : 0;

  res.json({
    totalListings,
    totalUsers,
    successfulSwaps,
    pendingSwaps,
    totalSwapRequests,
    conversionRate: `${conversionRate}%`,
  });
});

// Monitor all swap activities (all swap requests platform-wide)
router.get("/swaps", async (req, res) => {
  const swaps = await SwapRequest.find()
    .populate("requester", "name email")
    .populate("receiver", "name email")
    .populate("itemOffered", "title")
    .populate("itemRequested", "title")
    .sort({ createdAt: -1 });
  res.json(swaps);
});

// Resolve a disputed swap
router.put("/swaps/:id/resolve", async (req, res) => {
  const { resolution, finalStatus } = req.body; // finalStatus: "completed" | "rejected"
  const swap = await SwapRequest.findById(req.params.id);
  if (!swap) return res.status(404).json({ message: "Swap request not found" });

  swap.isDisputed = false;
  swap.disputeResolution = resolution;
  if (finalStatus) swap.status = finalStatus;
  await swap.save();
  res.json(swap);
});

module.exports = router;
