import express, { response } from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import userRoutes from "./routes/userRoutes.js";
import panelRoutes from "./routes/panelRoutes.js";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import sendEmail from "./sendEmails.js";
import dotenv from "dotenv";
import MongoDBSessionStore from "connect-mongodb-session";
import { MongoClient } from "mongodb";
dotenv.config();

// Create a new MongoDBSessionStore
const MongoDBStore = MongoDBSessionStore(session);

// Initialize MongoDBStore with session options
const store = new MongoDBStore({
  uri: mongoDBURL,
  collection: "sessions",
});

// Catch errors in MongoDBStore
store.on("error", function (error) {
  console.error("MongoDBStore Error:", error);
});

const app = express();

// Middleware for parsing request body
app.use(express.json());

// Define the directory where your static files (including HTML) are located
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve static files from the frontend directory
app.use(express.static(join(__dirname, "frontend")));

// Middleware for handling CORS policy
app.use(cors()); // This will allow all origins

// Allow custom origins
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//   })
// );

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 10000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (request, response) => {
  // response.send("Hello World")
  response.sendFile(join(__dirname, "frontend", "index.html"));
});

app.use("/accounts", userRoutes);
app.use("/panel", panelRoutes);

app.get("/getallusers", async (request, response) => {
  const users = await User.find();
  response.json(users);
});

app.get("/deleteallusers", async (request, response) => {
  const users = await User.deleteMany({});
  response.json(users);
});

// Route to log out of all sessions
app.get("/logoutAll", async (req, res) => {
  // Find all sessions in MongoDB
  const sessions = await store.all();
  console.log(sessions);
  try {
    // Clear all session data for the user
    await User.updateOne({ _id: req.user.id }, { $set: { sessions: [] } });
    res.send("Logged out of all sessions");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/delete-account", (req, res) => {
  res.send("DELETE Request Called");
});

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log("App is listening on port: ", PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
