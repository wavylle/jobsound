import express, { response } from "express";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import { User } from "../models/userModel.js";
import { JobDB } from "../models/jobModel.js";
import { ApplicationsDB } from "../models/applicationModel.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { request } from "http";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import sendEmail from "../sendEmails.js"; // Assuming the file is in the same directory
import { randomBytes } from "crypto";
import session from "express-session";
import connectEnsureLogin from "connect-ensure-login";
import bodyParser from "body-parser";
import { log } from "console";
import callOpenAI from "../openai.js";
import multer from "multer";
import fs from "fs";
import { createClient } from "@deepgram/sdk";
import WebSocket from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();
router.use(express.static(join(__dirname, "../", "frontend")));

const client = createClient("4225d9aafbf5ce6aab74dec2519e872b4e0090d5");

const getProjectId = async () => {
  const { result, error } = await client.manage.getProjects();

  if (error) {
    throw error;
  }

  return result.projects[0].project_id;
};

const getTempApiKey = async (projectId) => {
  const { result, error } = await client.manage.createProjectKey(projectId, {
    comment: "short lived",
    scopes: ["usage:write"],
    time_to_live_in_seconds: 20,
  });

  if (error) {
    throw error;
  }

  return result;
};

router.get("/key", async (req, res) => {
  const projectId = await getProjectId();
  const key = await getTempApiKey(projectId);

  res.json(key);
});

export default router;