const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});