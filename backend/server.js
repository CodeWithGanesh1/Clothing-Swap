const dns = require("dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first"
    
)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const clothingRoutes = require("./routes/clothing");
const swapRoutes = require("./routes/swap");
const chatRoutes = require("./routes/chat");
const adminRoutes = require("./routes/admin");

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://clothing-swap-five.vercel.app/",
  })
);
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/clothing", clothingRoutes);
app.use("/api/swap", swapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Clothing Exchange & Swap Marketplace API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
