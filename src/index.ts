import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { connectDB } from "./utils/connectDB";

const MONGO_URI = process.env.MONGO_URI || "";
connectDB(MONGO_URI);

// אם מריצים לוקאלית (לא ב־Vercel) → נאזין לפורט
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

export default app;
