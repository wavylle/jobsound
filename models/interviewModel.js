import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const interviewSchema = mongoose.Schema({
  user_id: {
    type: String,
  },
  job_id: {
    type: String,
  },
  job_title: {
    type: String,
  },
  application_id: {
    type: String,
  },
  interview_status: {
    type: Boolean,
    default: false,
  },
  interview_duration: {
    type: String
  },
  fitting_to_job: {
    type: String
  },
  confidence: {
    type: String
  },
  success_rate: {
    type: String
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

export const InterviewDB = mongoose.model(
  "InterviewDB",
  interviewSchema
);
