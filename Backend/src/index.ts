import express, { Request, Response } from "express";
import cors from "cors";
require("dotenv").config();
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config.json";
import mongoose from "mongoose";
const User = require("./models/user.model");
const Note = require("./models/note.model");
import { authenticateToken } from "./utils";

mongoose
  .connect(config.connectionString)
  .then(() => {
    console.log("Db Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
  });

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

//Get
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

//GetUser
app.get(
  "/get-user",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { user } = req.user as JwtPayload & { user: { _id: string } };
    const isUser = await User.findOne({ _id: user._id });
    if (!isUser) {
      res.sendStatus(400);
      return;
    }

    res.status(200).json({
      error: false,
      message: "User found successfuly",

      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    });
  }
);

//Notes
//ADDNOTE
app.post(
  "/add-note",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { title, content, tags } = req.body;
    const user = req.user as JwtPayload & { user: { _id: string } };

    if (!title) {
      res.status(400).json({ error: true, message: "Title is required" });
      return;
    }
    if (!content) {
      res.status(400).json({ error: true, message: "Content is required" });
      return;
    }

    try {
      const note = new Note({
        title,
        content,
        tags: tags || [],
        userId: user.user._id,
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
      return;
    }
  }
);

//EDITNOTE
app.put(
  "/edit-note/:noteId",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const user = req.user as JwtPayload & { user: { _id: string } };

    if (!title && !content && !tags) {
      res.status(400).json({ error: true, message: "No changes provided" });
    }

    try {
      const note = await Note.findOne({ _id: noteId, userId: user.user._id });
      if (!note) {
        res.status(400).json({ error: true, messsage: "Note not found" });
      }
      if (title) note.title = title;
      if (content) note.content = content;
      if (tags) note.tags = tags;
      if (isPinned) note.isPinned = isPinned;

      await note.save();

      res
        .status(200)
        .json({ error: false, note, message: "Note updated successfuly" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: true,
        message: "Internal Server error",
      });
      return;
    }
  }
);

//GetAllNotes
app.get(
  "/get-all-notes",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as JwtPayload & { user: { _id: string } };
    try {
      const notes = await Note.find({ userId: user.user._id }).sort({
        isPinned: -1,
      });
      res.json({
        error: false,
        notes,
        message: "All notes retrieved successfuly",
      });
    } catch (error) {
      res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  }
);

//DeleteNOtes
app.delete(
  "/delete-note/:noteId",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const noteId = req.params.noteId;
    const user = req.user as JwtPayload & { user: { _id: string } };
    try {
      const note = await Note.findOne({ _id: noteId, userId: user.user._id });
      if (!note) {
        res.status(400).json({ error: true, message: "Note not found" });
        return;
      }
      await Note.deleteOne({ _id: noteId, userId: user.user._id });
      res.json({
        error: false,
        message: "Note deleted successfuly",
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: true,
        message: "Internal server error",
      });
      return;
    }
  }
);

//UpdateIsPinned
app.put(
  "/update-note-pinned/:noteId",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user as JwtPayload & { user: { _id: string } };

    if (!isPinned) {
      res.status(400).json({ error: true, message: "No changes provided" });
      return;
    }

    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });
      if (!note) {
        res.status(400).json({ error: true, messsage: "Note not found" });
      }

      if (isPinned) note.isPinned = isPinned;

      await note.save();

      res
        .status(200)
        .json({ error: false, note, message: "Note updated successfuly" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: true,
        message: "Internal Server error",
      });
      return;
    }
  }
);

const PORT = 8000;
app.listen(`${PORT}`, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
