import express, { response } from "express";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import { User } from "../models/userModel.js";
import { JobDB } from "../models/jobModel.js";
import { ApplicationsDB } from "../models/applicationModel.js";
import { InterviewDB } from "../models/interviewModel.js";
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
    console.log(prompt)

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

router.post("/endmeeting", async (req, res) => {
  try {
    const jobId = req.body["jobId"]
    const applicantId = req.body["applicantId"]
    const interviewDuration = req.body["interviewDuration"]

    const getJobData = await JobDB.findOne({ job_id: jobId })
    const interviewData = {}

    if(getJobData) {
      const getApplicant = await ApplicationsDB.findOne({job_id: jobId, application_id: applicantId})

      if (getApplicant) {
        // main code
        interviewData["user_id"] = getApplicant.user_id
        interviewData["job_id"] = jobId
        interviewData["job_title"] = getApplicant.job_title
        interviewData["application_id"] = applicantId
        interviewData["interview_status"] = true
        interviewData["interview_duration"] = interviewDuration
        interviewData["fitting_to_job"] = "80"
        interviewData["confidence"] = "68"
        interviewData["success_rate"] = "98.5"

        const createInterview = await InterviewDB.create(interviewData);

        // update application db
        for (const [key, value] of Object.entries(interviewData)) {
          console.log(key)
          if(key in getApplicant) {
            console.log("Key Present");
            getApplicant[key] = value
          }
        }
        await getApplicant.save();


        res.send(true)
      } else {
        res.send(false)
      }
    } else {
      res.send(false)
    }
  } catch (error) {
    console.log(error)
    res.send(false)
  }
})

export default router;