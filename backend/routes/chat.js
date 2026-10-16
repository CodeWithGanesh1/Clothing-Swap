const express = require("express");
const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Send a message within a swap request's chat
router.post("/:swapId", protect, async (req, res) => {
  try {
    const { text } = req.body;
    const swap = await SwapRequest.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });

    const isParticipant =
      swap.requester.toString() === req.user.id || swap.receiver.toString() === req.user.id;
    if (!isParticipant) return res.status(403).json({ message: "Not part of this conversation" });

    const message = await Message.create({
      swapRequest: req.params.swapId,
      sender: req.user.id,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all messages for a swap request (chat history)
router.get("/:swapId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ swapRequest: req.params.swapId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
