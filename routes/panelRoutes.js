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

const ngrokUrl = "https://d648-110-227-193-66.ngrok-free.app"
const localUrl = "http://127.0.0.1:5555"
const siteUrl = "https://jobsound.vercel.app"

const generateToken = () => {
  return randomBytes(20).toString("hex");
};

// Create disk storage options
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const uploadDir = __dirname + "/uploads";
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const extension = file.originalname.split(".").pop();
    const originalNameWithoutExtension = file.originalname.replace(
      /\.[^/.]+$/,
      ""
    );
    const fullFileName = `${generateToken()}_${Date.now()}.${extension}`;
    callback(null, fullFileName);
  },
});

// Set saved storage options:
const upload = multer({ storage: storage });

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();
router.use(express.static(join(__dirname, "../", "frontend")));

router.get(
  "/get-user-info",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    let userJson = {
      name: request.user.name,
      company: request.user.company,
      email: request.user.email,
    };
    response.send(userJson);
  }
);

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  try {
    if (req.session.passport.user) {
        return next();
    } else {
        res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
}

router.get("/home", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), (request, response) => {
      response.sendFile(join(__dirname, "../", "frontend", "panel", "jobsound-dash-new.html"));
  }
);

router.get("/currentuser", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), (request, response) => {
    response.send(request.session)
})

router.get(
  "/jobs",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    response.sendFile(
      join(__dirname, "../", "frontend", "panel", "jobsound-dash-jobs.html")
    );
  }
);

router.get(
  "/applicants",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    response.sendFile(
      join(
        __dirname,
        "../",
        "frontend",
        "panel",
        "jobsound-dash-applicants.html"
      )
    );
  }
);

router.get(
  "/get_applicants_data",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    const applicants = await ApplicationsDB.find({ user_id: request.user.id });
    // const applicants = await ApplicationsDB.find();
    response.status(200).send(applicants);
  }
);

let new_job_dictionary = {};

router.get(
  "/add-new-job",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    new_job_dictionary = {};
    if (request.session.jobDataDictionary) {
      // Delete the jobDataDictionary from the session
      delete request.session.jobDataDictionary;
      console.log("New job created successfully");
    } else {
      console.log("Job Dictionary not present in the current session");
    }
    response.status(200).send({ message: "New job created successfully" });
  }
);

router.get(
  "/onboarding-basics",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    // Initialize data dictionary in the session if it doesn't exist
    if (!request.session.jobDataDictionary) {
      request.session.jobDataDictionary = {};
    }
    response.sendFile(
      join(
        __dirname,
        "../",
        "frontend",
        "panel",
        "jobsound-dash-onboarding.html"
      )
    );
  }
);

router.post(
  "/basic-job-data",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    console.log("Data: ", request.body);

    // Loop over key-value pairs using for...in loop
    for (const key in request.body) {
      if (request.body.hasOwnProperty(key)) {
        new_job_dictionary[key] = request.body[key];
        console.log("Session data: ", request.session);
        if (!request.session.jobDataDictionary) {
          request.session.jobDataDictionary = {};
        }
        request.session.jobDataDictionary[key] = request.body[key];
      }
    }
    console.log(request.session);
    console.log("Saved Data in the Session");
    response.status(200).send({ message: "Job data saved successfully" });
  }
);

router.get(
  "/onboarding-job-details",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    response.sendFile(
      join(
        __dirname,
        "../",
        "frontend",
        "panel",
        "jobsound-dash-onboarding-2.html"
      )
    );
  }
);

router.get(
  "/onboarding-interview-questions",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    response.sendFile(
      join(
        __dirname,
        "../",
        "frontend",
        "panel",
        "jobsound-dash-onboarding-3.html"
      )
    );
  }
);

router.get(
  "/onboarding-ai-settings",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  (request, response) => {
    response.sendFile(
      join(
        __dirname,
        "../",
        "frontend",
        "panel",
        "jobsound-dash-onboarding-4.html"
      )
    );
  }
);

router.get(
  "/new-job-data",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    const { refJobId } = request.query;
    console.log("Ref: ", refJobId);
    if (refJobId) {
      const getJobData = await JobDB.findOne({
        user_id: request.user.id,
        job_id: refJobId,
      });
      if (getJobData) {
        console.log(getJobData);
        response.status(200).send({ status: "ok", data: getJobData });
      } else {
        response.send("Job not found in the database.");
      }
    } else {
      if (request.session.jobDataDictionary) {
        response
          .status(200)
          .send({ status: "ok", data: request.session.jobDataDictionary });
      } else {
        response.status(400).send({ status: "error" });
      }
    }
  }
);

router.get(
  "/ai_description",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    if (
      (request.session.jobDataDictionary["title"] &&
        request.session.jobDataDictionary["company"] &&
        request.session.jobDataDictionary["jobtype"] &&
        request.session.jobDataDictionary["workplace"]) ||
      request.session.jobDataDictionary["location"]
    ) {
      let prompt = `Generate a job description based on the given data:
        Job Title: ${request.session.jobDataDictionary["title"]}
        Company: ${request.session.jobDataDictionary["company"]}
        Location: ${request.session.jobDataDictionary["location"]}
        Workplace: ${request.session.jobDataDictionary["workplace"]}
        Job Type: ${request.session.jobDataDictionary["jobtype"]}`;
      const aiResponse = await callOpenAI(prompt);
      response.status(200).send(aiResponse);
    } else {
      response.status(400).send({
        message:
          "Some information is missing. Please provide it to our AI helper.",
      });
    }
  }
);

router.get(
  "/ai_skills",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    if (
      (request.session.jobDataDictionary["title"] &&
        request.session.jobDataDictionary["company"] &&
        request.session.jobDataDictionary["jobtype"] &&
        request.session.jobDataDictionary["workplace"]) ||
      request.session.jobDataDictionary["location"]
    ) {
      let prompt = `Generate a coma separated list of less than 10 skills based on the given data. Make sure you return coma separated list:
        Job Title: ${request.session.jobDataDictionary["title"]}
        Company: ${request.session.jobDataDictionary["company"]}
        Location: ${request.session.jobDataDictionary["location"]}
        Workplace: ${request.session.jobDataDictionary["workplace"]}
        Job Type: ${request.session.jobDataDictionary["jobtype"]}`;
      const aiResponse = await callOpenAI(prompt);
      response.status(200).send(aiResponse);
    } else {
      response.status(400).send({
        message:
          "Some information is missing. Please provide it to our AI helper.",
      });
    }
  }
);

router.get(
  "/ai_interview_questions",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    if (
      (request.session.jobDataDictionary["title"] &&
        request.session.jobDataDictionary["company"] &&
        request.session.jobDataDictionary["jobtype"] &&
        request.session.jobDataDictionary["workplace"]) ||
      (request.session.jobDataDictionary["location"] &&
        request.session.jobDataDictionary["jobdescription"] &&
        request.session.jobDataDictionary["skill"])
    ) {
      let prompt = `Generate an interview question based on the given data:
        Job Title: ${request.session.jobDataDictionary["title"]}
        Company: ${request.session.jobDataDictionary["company"]}
        Location: ${request.session.jobDataDictionary["location"]}
        Workplace: ${request.session.jobDataDictionary["workplace"]}
        Job Type: ${request.session.jobDataDictionary["jobtype"]}
        Job Description: ${request.session.jobDataDictionary["jobdescription"]}
        Skills: ${request.session.jobDataDictionary["skill"]}`;
      const aiResponse = await callOpenAI(prompt);
      response.status(200).send(aiResponse);
    } else {
      response.status(400).send({
        message:
          "Some information is missing. Please provide it to our AI helper.",
      });
    }
  }
);

router.get(
  "/publish_job",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    const { refJobId } = request.query;
    console.log("To Publish Session: ", request.session.jobDataDictionary);
    console.log("To Publish Data: ", request.session.jobDataDictionary);
    if (request.session.jobDataDictionary) {
      const jobData = {};
      for (const [key, value] of Object.entries(
        request.session.jobDataDictionary
      )) {
        jobData[key] = value;
      }

      console.log(request.user);
      jobData["user_id"] = request.user.id;
      jobData["user_email"] = request.user.email;
      jobData["job_id"] = generateToken();
      jobData["publish_status"] = true;

      if (refJobId) {
        const getJobData = await JobDB.findOne({
          user_id: request.user.id,
          job_id: refJobId,
        });
        if (getJobData) {
          console.log("Found Job Data.");
          // Define filter to find the job by its ID
          const filter = { job_id: refJobId };

          // Define the update operation
          const updateOperation = {
            $set: jobData,
          };

          console.log("Updating DB.");

          // Perform the update operation
          const result = await JobDB.findOneAndUpdate(filter, updateOperation, {
            returnOriginal: false,
          });

          // Print the updated document
          console.log("Updated document:", result.value);

          // const updateJob = await getJobData.updateOne(jobData)
        }
      } else {
        const createJob = await JobDB.create(jobData);

        console.log("Publishing Job: ", jobData);
      }

      // if (request.session.jobDataDictionary) {
      //     // Delete the jobDataDictionary from the session
      //     delete request.session.jobDataDictionary;
      //     console.log("New job created successfully")
      // } else {
      //     console.log("Job Dictionary not present in the current session")
      //   }

      response.send({ message: "Job published successfully" });
    }
  }
);

router.get(
  "/job_save_draft",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    const { refJobId } = request.query;
    if (request.session.jobDataDictionary) {
      const jobData = {};
      for (const [key, value] of Object.entries(
        request.session.jobDataDictionary
      )) {
        jobData[key] = value;
      }

      console.log(request.user);
      jobData["user_id"] = request.user.id;
      jobData["user_email"] = request.user.email;
      jobData["job_id"] = generateToken();
      jobData["publish_status"] = false;

      if (refJobId) {
        const getJobData = await JobDB.findOne({
          user_id: request.user.id,
          job_id: refJobId,
        });
        if (getJobData) {
          console.log("Found Job Data.");
          // Define filter to find the job by its ID
          const filter = { job_id: refJobId };

          // Define the update operation
          const updateOperation = {
            $set: jobData,
          };

          console.log("Updating DB.");

          // Perform the update operation
          const result = await JobDB.findOneAndUpdate(filter, updateOperation, {
            returnOriginal: false,
          });
          // const updateJob = await getJobData.updateOne(jobData)
        }
      } else {
        const createJob = await JobDB.create(jobData);
      }

      // if (request.session.jobDataDictionary) {
      //     // Delete the jobDataDictionary from the session
      //     delete request.session.jobDataDictionary;
      //     console.log("New job created successfully")
      // } else {
      //     console.log("Job Dictionary not present in the current session")
      //   }

      response.send({ message: "Job successfully saved as draft" });
    }
  }
);

router.get("/deletealljobs", async (request, response) => {
  const jobs = await JobDB.deleteMany({});
  response.json(jobs);
});

router.get("/getalljobs", async (request, response) => {
  const jobs = await JobDB.find();
  response.json(jobs);
});

router.get(
  "/get_jobs",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    const jobs = await JobDB.find({ user_id: request.user.id });
    // const jobs = await JobDB.find();
    response.status(200).send(jobs);
  }
);

router.get(
  "/updateJobStatus",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    const { jobId } = request.query;
    const getJob = await JobDB.findOne({
      user_id: request.user.id,
      job_id: jobId,
    });
    console.log(getJob);
    // const getJob = await JobDB.findOne({ job_id: jobId })
    if (getJob) {
      if (getJob.publish_status == true) {
        // set publish_status to false
        getJob.publish_status = false;
        getJob.save();
      } else {
        // set publish_status to true
        getJob.publish_status = true;
        getJob.save();
      }
    }

    response.send({
      status: true,
      message: "Successfully updated the job status",
    });
  }
);

router.get("/job", async (request, response) => {
  const { jobId } = request.query;
  const getJobData = await JobDB.findOne({ job_id: jobId });

  if (getJobData) {
    if (request.isAuthenticated()) {
      if (getJobData.user_id == request.user.id) {
        // load html
        response.sendFile(
          join(__dirname, "../", "frontend", "panel", "job-page.html")
        );
      } else {
        response.send("You do not have access to this job post");
      }
    } else if (getJobData.publish_status == true) {
      response.sendFile(
        join(__dirname, "../", "frontend", "panel", "job-page.html")
      );
    } else {
      response.send("You do not have access to this job post");
    }
  } else {
    response.send("Job was not found in the database");
  }
});

router.get("/apply", async (request, response) => {
  const { jobId } = request.query;
  const getJobData = await JobDB.findOne({ job_id: jobId });

  if (getJobData) {
    if (request.isAuthenticated()) {
      if (getJobData.user_id == request.user.id) {
        // load html
        response.sendFile(
          join(__dirname, "../", "frontend", "panel", "application-page.html")
        );
      }
    } else if (getJobData.publish_status == true) {
      response.sendFile(
        join(__dirname, "../", "frontend", "panel", "application-page.html")
      );
    } else {
      response.send("You do not have access to this job post");
    }
  } else {
    response.send("This job was not found in the database");
  }
});

router.post(
  "/apply",
  upload.fields([{ name: "profile-upload" }, { name: "cv-upload" }]),
  async (request, response) => {
    const { jobId } = request.query;
    const getJobData = await JobDB.findOne({ job_id: jobId });
    console.log(request.body.email)
    if (getJobData) {
      if (getJobData.publish_status == true) {
        var emailInApplicationsDB = await ApplicationsDB.findOne({job_id: jobId, email: request.body.email})
        if (!emailInApplicationsDB) {
        const applicantId = generateToken()
        const applicationData = {
          user_id: getJobData.user_id,
          job_id: jobId,
          application_id: applicantId,
          job_title: getJobData.title,
        };
        for (const [key, value] of Object.entries(request.body)) {
          applicationData[key.replace("-", "_")] = value;
        }
        if (request.files["profile-upload"]) {
          applicationData["profileImagePath"] =
            request.files["profile-upload"][0]["filename"];
        }
        if (request.files["cv-upload"]) {
          applicationData["cvPath"] = request.files["cv-upload"][0]["filename"];
        }

        const createApplication = await ApplicationsDB.create(applicationData);

        // Send Email
        await sendEmail(
          `Your Interview Invitation for ${applicationData["job_title"]} at JobSound`,
          applicationData["email"],
          `Thank you for your interest in the position titled '<strong>${applicationData["job_title"]}</strong>' with JobSound!<br><br>Please find below the link to your interview session:<br><a href="${siteUrl}/panel/meeting?jobId=${applicationData["job_id"]}&applicantId=${applicationData["application_id"]}">Start Interview</a>.<br><br>Wishing you the best of luck!`
          );
        response.send({ status: true, applicant_id: applicantId});
      } else {
        response.send({
          status: false,
          message: "Seems like you have already applied for this job",
        });
      }
      } else {
        response.send({
          status: false,
          message: "This job is not published to accept applications",
        });
      }
    } else {
      response.send({
        status: false,
        message: "This job was not found in the database",
      });
    }
  }
);

// Serve uploaded files statically
router.use("/uploads", express.static(__dirname + "/uploads"));

router.get("/deleteallapplications", async (request, response) => {
  const applications = await ApplicationsDB.deleteMany({});
  response.json(applications);
});

router.get("/getallapplications", async (request, response) => {
  const applications = await ApplicationsDB.find();
  response.json(applications);
});

// User filtered applications data
router.get("/getapplications", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), async (request, response) => {
  const applications = await ApplicationsDB.find({ user_id: request.user.id });
  response.json(applications);
});

router.get("/getjobdata", async (request, response) => {
  const { jobId } = request.query;
  const getJobData = await JobDB.findOne({ job_id: jobId });

  if (getJobData) {
    // Job Found, return HTML
    response.send({ status: true, data: getJobData });
  } else {
    response.send({
      status: false,
      message: "Job was not found in the database",
    });
  }
});

router.get("/getapplicantdata", async (request, response) => {
  const { applicationId } = request.query;
  const getApplicationData = await ApplicationsDB.findOne({
    application_id: applicationId,
  });

  if (getApplicationData) {
    // Job Found, return HTML
    response.send({ status: true, data: getApplicationData });
  } else {
    response.send({
      status: false,
      message: "Application was not found in the database",
    });
  }
});

router.get("/application-successful", (request, response) => {
  response.sendFile(
    join(__dirname, "../", "frontend", "panel", "ty-applying.html")
  );
});

router.get(
  "/application",
  connectEnsureLogin.ensureLoggedIn("/accounts/signin"),
  async (request, response) => {
    const { applicationId } = request.query;
    const getApplicationData = await ApplicationsDB.findOne({
      application_id: applicationId,
    });

    if (getApplicationData) {
      if (request.isAuthenticated()) {
        if (getApplicationData.user_id == request.user.id) {
          // load html
          response.sendFile(
            join(
              __dirname,
              "../",
              "frontend",
              "panel",
              "jobsound-dash-applicant.html"
            )
          );
        } else {
          response.send("You do not have access to this job application");
        }
      } else {
        response.send("You do not have access to this job application");
      }
    } else {
      response.send("Application was not found in the database");
    }
  }
);

router.get("/download", (request, response) => {
  const { fileName } = request.query;
  const uploadDir = __dirname + "/uploads";

  if (fileName) {
    const filePath = uploadDir + "/" + fileName;
    response.download(filePath, function (err) {
      if (err) {
        console.error("Error downloading file:", err);
        response.status(500).send("Internal Server Error");
      } else {
        console.log("File downloaded successfully");
      }
    });
  } else {
    response.status(500).send("Internal Server Error");
  }
});

router.get("/meeting", async (request, response) => {
  const { jobId } = request.query;
  const { applicantId } = request.query;
  if (jobId) {
    const getJob = await JobDB.findOne({
      job_id: jobId,
    });
    if (getJob) {
      if (getJob.publish_status == true) {
        if(applicantId) {
          const getApplicant = await ApplicationsDB.findOne({job_id: jobId, application_id: applicantId})

          if(getApplicant) {
            response.sendFile(
              join(__dirname, "../", "frontend", "panel", "meeting-page.html")
              );
            } else {
              response.send("Seems like you have not applied for this job")
            }
          } else {
            response.send("Invalid applicant ID")
          }
      }
    }
  } else {
    response.send("Invalid job ID");
  }
});

router.get("/account-settings", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), async (request, response) => {
  response.sendFile(
    join(__dirname, "../", "frontend", "panel", "account-settings.html")
  );
})

router.post("/edit-personal-information", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), async (request, response) => {
  console.log(request.body)
  const filter = { _id: request.user.id };

  // Define the update operation
  const updateOperation = {
    $set: request.body,
  };

  // Perform the update operation
  const result = await User.findOneAndUpdate(filter, updateOperation, {
    returnOriginal: false,
  });

  if (!result) {
    return response.status(500).send({message: "Invalid user"})
  }

  response.status(200).send({message: "Successfully updated personal information data."})
})

router.post("/change-password", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), async (request, response) => {
  console.log(request.body)
  const userData = await User.findOne({_id: request.user.id, password: request.body.current_password})
  console.log(userData)

  if(userData) {
    if (request.body.new_password === request.body.confirm_password) {
      userData.password = request.body.new_password
      userData.save()
    } else {
      return response.status(500).send({message: "Passwords don't match, please try again"})
    }
  } else {
    return response.status(500).send({message: "Incorrect current password"})
  }

  response.status(200).send({message: "Successfully changed password"})
})

router.get("/billing-settings", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), async (request, response) => {
  response.sendFile(
    join(__dirname, "../", "frontend", "panel", "billing-settings.html")
  );
})

router.get("/teams-settings", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), async (request, response) => {
  response.sendFile(
    join(__dirname, "../", "frontend", "panel", "teams-settings.html")
  );
})

export default router;
