"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv").config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_json_1 = __importDefault(require("../config.json"));
const mongoose_1 = __importDefault(require("mongoose"));
const User = require("./models/user.model");
const Note = require("./models/note.model");
const utils_1 = require("./utils");
mongoose_1.default
    .connect(config_json_1.default.connectionString)
    .then(() => {
    console.log("Db Connected");
})
    .catch((err) => {
    console.error("MongoDB Connection Failed:", err);
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
}));
//Get
app.get("/", (req, res) => {
    res.json({ data: "hello" });
});
//CreateAccountApi
app.post("/create-account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const isUser = yield User.findOne({ email });
        if (isUser) {
            res.json({ error: true, message: "User already exists." });
            return;
        }
        const user = new User({ fullName, email, password });
        yield user.save();
        const accessToken = jsonwebtoken_1.default.sign({ user }, process.env.SECRET_KEY, {
            expiresIn: "36000m",
        });
        res.json({
            error: false,
            user,
            accessToken,
            message: "Registration Successful",
        });
    }
    catch (error) {
        res.status(500).json({ error: true, message: "Server error" });
    }
}));
//loginApi
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
    }
    const userInfo = yield User.findOne({ email: email });
    if (!userInfo) {
        res.status(400).json({ message: "User not found" });
        return;
    }
    if (userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo };
        const accessToken = jsonwebtoken_1.default.sign(user, process.env.SECRET_key, {
            expiresIn: "3600m",
        });
        res.json({
            error: false,
            message: "Login Successful",
            email,
            accessToken,
        });
    }
    else {
        res.status(400).json({
            error: true,
            message: "Invalid Credentials",
        });
    }
}));
//GetUser
app.get("/get-user", utils_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.user;
    const isUser = yield User.findOne({ _id: user._id });
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
}));
//Notes
//ADDNOTE
app.post("/add-note", utils_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, tags } = req.body;
    const user = req.user;
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
        yield note.save();
        res.json({
            error: false,
            note,
            message: "Note added successfuly",
        });
    }
    catch (error) {
        res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
        return;
    }
}));
//EDITNOTE
app.put("/edit-note/:noteId", utils_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const user = req.user;
    if (!title && !content && !tags) {
        res.status(400).json({ error: true, message: "No changes provided" });
    }
    try {
        const note = yield Note.findOne({ _id: noteId, userId: user.user._id });
        if (!note) {
            res.status(400).json({ error: true, messsage: "Note not found" });
        }
        if (title)
            note.title = title;
        if (content)
            note.content = content;
        if (tags)
            note.tags = tags;
        if (isPinned)
            note.isPinned = isPinned;
        yield note.save();
        res
            .status(200)
            .json({ error: false, note, message: "Note updated successfuly" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: "Internal Server error",
        });
        return;
    }
}));
//GetAllNotes
app.get("/get-all-notes", utils_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const notes = yield Note.find({ userId: user.user._id }).sort({
            isPinned: -1,
        });
        res.json({
            error: false,
            notes,
            message: "All notes retrieved successfuly",
        });
    }
    catch (error) {
        res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
}));
//DeleteNOtes
app.delete("/delete-note/:noteId", utils_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const noteId = req.params.noteId;
    const user = req.user;
    try {
        const note = yield Note.findOne({ _id: noteId, userId: user.user._id });
        if (!note) {
            res.status(400).json({ error: true, message: "Note not found" });
            return;
        }
        yield Note.deleteOne({ _id: noteId, userId: user.user._id });
        res.json({
            error: false,
            message: "Note deleted successfuly",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            error: true,
            message: "Internal server error",
        });
        return;
    }
}));
//UpdateIsPinned
app.put("/update-note-pinned/:noteId", utils_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;
    if (isPinned === undefined) {
        res.status(400).json({ error: true, message: "No changes provided" });
        return;
    }
    try {
        const note = yield Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            res.status(400).json({ error: true, messsage: "Note not found" });
        }
        note.isPinned = isPinned;
        yield note.save();
        res
            .status(200)
            .json({ error: false, note, message: "Note updated successfuly" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: "Internal Server error",
        });
        return;
    }
}));
//SearchApi
app.get("/search-notes/", utils_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.user;
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
        res.status(400).json({ error: true, message: "Search query is required"
        });
        return;
    }
    try {
        const matchingNotes = yield Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        });
        res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retreived successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            error: true,
            message: "Internal Server Error"
        });
        return;
    }
}));
const PORT = process.env.PORT;
app.listen(`${PORT}`, () => {
    console.log(`Server running on port ${PORT}`);
});
module.exports = app;
