const express = require("express");
const SwapRequest = require("../models/SwapRequest");
const Clothing = require("../models/Clothing");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Send a swap request
router.post("/", protect, async (req, res) => {
  try {
    const { itemOffered, itemRequested } = req.body;

    const offeredItem = await Clothing.findById(itemOffered);
    const requestedItem = await Clothing.findById(itemRequested);

    if (!offeredItem || !requestedItem) {
      return res.status(404).json({ message: "One or both items not found" });
    }
    if (offeredItem.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only offer your own item" });
    }

    const swap = await SwapRequest.create({
      requester: req.user.id,
      receiver: requestedItem.owner,
      itemOffered,
      itemRequested,
    });

    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get incoming requests (requests sent to me)
router.get("/incoming", protect, async (req, res) => {
  try {
    const requests = await SwapRequest.find({ receiver: req.user.id })
      .populate("requester", "name location")
      .populate("itemOffered")
      .populate("itemRequested")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get outgoing requests (requests I sent)
router.get("/outgoing", protect, async (req, res) => {
  try {
    const requests = await SwapRequest.find({ requester: req.user.id })
      .populate("receiver", "name location")
      .populate("itemOffered")
      .populate("itemRequested")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Accept or reject a swap request
router.put("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body; // "accepted" | "rejected" | "completed"
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    if (swap.receiver.toString() !== req.user.id && status !== "completed") {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    swap.status = status;
    await swap.save();

    if (status === "accepted") {
      await Clothing.findByIdAndUpdate(swap.itemOffered, { status: "pending" });
      await Clothing.findByIdAndUpdate(swap.itemRequested, { status: "pending" });
    }
    if (status === "completed") {
      await Clothing.findByIdAndUpdate(swap.itemOffered, { status: "swapped" });
      await Clothing.findByIdAndUpdate(swap.itemRequested, { status: "swapped" });
    }
    if (status === "rejected") {
      await Clothing.findByIdAndUpdate(swap.itemOffered, { status: "available" });
      await Clothing.findByIdAndUpdate(swap.itemRequested, { status: "available" });
    }

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Raise a dispute on a swap (either party can flag an issue)
router.put("/:id/dispute", protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    const isParticipant =
      swap.requester.toString() === req.user.id || swap.receiver.toString() === req.user.id;
    if (!isParticipant) return res.status(403).json({ message: "Not part of this swap" });

    swap.isDisputed = true;
    swap.disputeReason = reason;
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
