import express, { Request, Response } from "express";
import cors from "cors";
require("dotenv").config();
import jwt from "jsonwebtoken";

import config from "../config.json";
import mongoose from "mongoose";
const User = require("./models/user.model");

mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());

import { authenticateToken } from "./utils";

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req: Request, res: Response) => {
  res.json({ data: "hello" });
});

//CreateAccountApi
app.post(
  "/create-account",
  async (req: Request, res: Response): Promise<void> => {
    // ✅ Correct return type
    try {
      const { fullName, email, password } = req.body;

      if (!fullName) {
        res.status(400).json({ error: true, message: "Full Name is required" });
        return;
      }
      if (!email) {
        res.status(400).json({ error: true, message: "Email is required" });
        return;
      }
      if (!password) {
        res.status(400).json({ error: true, message: "Password is required" });
        return;
      }

      const isUser = await User.findOne({ email });

      if (isUser) {
        res.json({ error: true, message: "User already exists." });
        return;
      }

      const user = new User({ fullName, email, password });
      await user.save();

      const accessToken = jwt.sign({ user }, process.env.SECRET_KEY as string, {
        expiresIn: "36000m",
      });

      res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful",
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Server error" });
    }
  }
);

app.listen(8000, () => {
  console.log("Server running on port 8000");
});

module.exports = app;
