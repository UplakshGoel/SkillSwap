require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const profile = require("./routes/profile");
const projectRoutes = require("./routes/projectRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/profile", profile);
app.use("/api/projects", projectRoutes);
app.use("/api/ai", aiRoutes);


// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});