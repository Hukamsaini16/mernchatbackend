
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Import from 'url' module
import { DB_NAME } from "./src/constants.js";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to create the necessary upload directories if they don't exist
const createUploadDirectories = () => {
  const profilesDir = path.join(__dirname, 'uploads', 'profiles');
  const filesDir = path.join(__dirname, 'uploads', 'files');

  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
    console.log(`Directory ${profilesDir} created.`);
  }

  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
    console.log(`Directory ${filesDir} created.`);
  }
};

// Ensure upload directories exist before starting the server
createUploadDirectories();

app.use(cors({
    origin: process.env.ORIGIN, // Allow this specific origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Serve static files for profile pictures and other uploads
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve the index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// Setup Socket.IO
setupSocket(server);

// Connect to the database with better error handling
mongoose.connect(`${databaseURL}/${DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("DB Connected Successfully"))
.catch(err => {
    console.error("DB Connection Error:", err.message);
});





