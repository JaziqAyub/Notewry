import express, { Request, Response } from "express";
import cors from "cors";
require("dotenv").config();
import jwt from "jsonwebtoken";

import config from "../config.json";
import mongoose from "mongoose";
const User = require("./models/user.model");
const Note = require("./models/note.model");

mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());

import { authenticateToken } from "./utils";
import { error } from "console";

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

//loginApi
app.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  if (!password) {
    res.status(400).json({ message: "Password is required" });
    return;
  }

  const userInfo = await User.findOne({ email: email });

  if (!userInfo) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.SECRET_key as string, {
      expiresIn: "3600m",
    });

    res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken,
    });
  } else {
    res.status(400).json({
      error: true,
      message: "Invalid Credentials",
    });
  }
});

//ADDNOTE
app.post("/add-note", async (req: Request, res: Response): Promise<void> => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!config) {
    res.status(400).json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    res.json({
      error: false,
      note,
      message: "Note added successfuly",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

const PORT = 8000;
app.listen(`${PORT}`, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
