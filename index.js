import express, { response } from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { JobDB } from "./models/jobModel.js";
import { ApplicationsDB } from "./models/applicationModel.js";
import userRoutes from "./routes/userRoutes.js";
import panelRoutes from "./routes/panelRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
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
import status from "express-status-monitor";
import { createClient } from "@deepgram/sdk";
import WebSocket from 'ws';
import expressWs from "express-ws"
import AdminJS, { App } from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { bundle } from '@adminjs/bundler';
import { ComponentLoader } from 'adminjs';
const componentLoader = new ComponentLoader();

(async () => {
    const files = await bundle({
        componentLoader,
        destinationDir: 'public', // relative to CWD
    });
})();
import bcrypt from "bcrypt";

dotenv.config();
import OpenAI from 'openai';

const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({apiKey: API_KEY});

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

expressWs(app)

AdminJS.registerAdapter(AdminJSMongoose)

// Very basic configuration of AdminJS.
const adminJs = new AdminJS({
  resources: [
    {
        resource: User,
    },
    {
        resource: JobDB,
    },
    {
        resource: ApplicationsDB,
    },
  ],
  rootPath: "/admin", // Path to the AdminJS dashboard.
  assetsCDN: "https://jobsound.vercel.app"
});

// Build and use a router to handle AdminJS routes.
const router = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
      cookieName: "adminjs",
      cookiePassword: "complicatedsecurepassword",
      authenticate: async (email, password) => {
          const user = await User.findOne({ email: email, password: password, isAdmin: true });
          if (user) {
            return user
          }
          return false;
      },
  },
  null,
  // Add configuration required by the express-session plugin.
  {
      resave: false, 
      saveUninitialized: true,
  }
);
app.use(adminJs.options.rootPath, router);

app.ws('/echo', (ws, req) => {
  // This callback is invoked when a WebSocket connection is established
  ws.send(JSON.stringify({status: "end", message: "Connection Opened"}));

  // Handle incoming messages from the client
  ws.on('message', async (message) => {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
      stream: true,
    });
    for await (const part of stream) {
      ws.send(JSON.stringify({status: "process", message: part.choices[0]?.delta?.content || ''}));
    }

    setTimeout(() => {
      ws.send(JSON.stringify({status: "end"}));
    }, 2000)

    // Echo the received message back to the client
    // ws.send(`Echo: ${message}`);
  });

  // Handle WebSocket connection close event
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Perform cleanup or any necessary tasks here
  });
});

app.use(status())
// Middleware for parsing request body
app.use(express.json());

// Define the directory where your static files (including HTML) are located
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve static files from the frontend directory
app.use(express.static(join(__dirname, "frontend")));
app.use(express.static(join(__dirname, "public")));
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
app.use("/meeting", meetingRoutes);

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
    const server = app.listen(PORT, () => {
      console.log("App is listening on port: ", PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
