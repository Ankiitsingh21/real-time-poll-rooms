require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const pollRoutes = require("./routes/pollRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 6000;

app.set("trust proxy", true);

// app.use(
//     cors({
//         origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//         credentials: true,
//     })
// );
app.use(cors());
app.use(express.json());

app.use("/api/polls", pollRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

connectDB().then(() => {
  // console.log("hello");
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});
