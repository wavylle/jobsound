import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const newApplicationSchema = mongoose.Schema({
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
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
  },
  country: {
    type: String,
  },
  countrycode: {
    type: String,
  },
  phonenumber: {
    type: String,
  },
  website: {
    type: String,
  },
  experience: {
    type: String,
  },
  salary_expectation: {
    type: String,
  },
  about: {
    type: String,
  },
  profileImagePath: {
    type: String,
  },
  cvPath: {
    type: String,
  },
  interview_status: {
    type: Boolean,
    default: false,
  },
  interview_duration: {
    type: String,
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

export const ApplicationsDB = mongoose.model(
  "ApplicationsDB",
  newApplicationSchema
);
