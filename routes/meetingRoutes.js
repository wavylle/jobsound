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
import dotenv from "dotenv";
import * as PlayHT from 'playht';
import EventEmitter from 'events';
import { streamGptText } from './streamGptText.js';
dotenv.config();

// Set the global maximum number of listeners
EventEmitter.defaultMaxListeners = 100;

// Initialize PlayHT SDK
try {
  PlayHT.init({
    apiKey:
      process.env.PLAYHT_API_KEY,
    userId:
      process.env.PLAYHT_USER_ID,
  });
} catch (error) {
  console.log('Failed to initialise PlayHT SDK', error.message);
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();
router.use(express.static(join(__dirname, "../", "frontend")));

const client = createClient(process.env.DEEPGRAM_API_KEY);

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

// Endpoint to convert ChatGPT prompt response into audio stream
router.get('/say-prompt', async (req, res) => {
  try {
    const { prompt } = req.query;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).send('ChatGPT prompt not provided in the request');
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');

    // Measure TTFB for ChatGPT API
    const gptStartTime = Date.now();
    const { stream: gptStream, chatGptTTFB } = await streamGptText(prompt);
    const gptTTFB = Date.now() - gptStartTime;

    // Measure TTFB for PlayHT API
    const playHTStartTime = Date.now();
    let playHTTTFBMeasured = false;  // A flag to ensure we measure TTFB only once
    const stream = await PlayHT.stream(gptStream, { voiceId: "s3://voice-cloning-zero-shot/801a663f-efd0-4254-98d0-5c175514c3e8/jennifer/manifest.json" });

    // Set the TTFB values as response headers
    stream.once('data', () => {
      if (!playHTTTFBMeasured) {
        const playHTTTFB = Date.now() - playHTStartTime;
        playHTTTFBMeasured = true;
        console.log(`ChatGPT TTFB: ${gptTTFB}ms, PlayHT TTFB: ${playHTTTFB}ms`);
        res.setHeader('X-PlayHT-TTFB', playHTTTFB);
        res.setHeader('X-ChatGPT-TTFB', chatGptTTFB);
      }

    });
    // Pipe response audio stream to browser
    stream.pipe(res);
  } catch (error) {
    console.error('Error!!:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;