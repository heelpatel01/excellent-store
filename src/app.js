import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes import
import useRouter from "./routes/user.routes.js";

//router declaration
app.get("/test", (req, res) => {
  return res.send("cool");
});
app.use("/api/v1/users", useRouter);

export { app };
