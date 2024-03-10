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

app.use(session({
  secret: 'r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#',
  resave: false,
  saveUninitialized: true,
  // cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));
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
  response.json(users)
})

app.get("/deleteallusers", async (request, response) => {
  const users = await User.deleteMany({});
  response.json(users)
})

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
