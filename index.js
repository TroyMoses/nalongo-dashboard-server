import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import childRouter from "./routes/child.routes.js";
import leaderRouter from "./routes/leader.routes.js";
import chapterSwitzerlandRouter from "./routes/chapter-switzerland.routes.js";
import chapterGermanyRouter from "./routes/chapter-Germany.routes.js";
import chapterDenmarkRouter from "./routes/chapter-denmark.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send({ message: "Nalongo Dashboard Server is running fine !" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/children", childRouter);
app.use("/api/v1/leaders", leaderRouter);
app.use("/api/v1/chapter-switzerland", chapterSwitzerlandRouter);
app.use("/api/v1/chapter-germany", chapterGermanyRouter);
app.use("/api/v1/chapter-denmark", chapterDenmarkRouter);

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);

    app.listen(8080, () =>
      console.log("Server started on port http://localhost:8080"),
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
