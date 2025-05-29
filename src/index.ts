import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./utils/connectDB";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "";

const startServer = async () => {
  try {
    await connectDB(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
