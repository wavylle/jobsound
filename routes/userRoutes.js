import express, { response } from "express";
import mongoose from "mongoose";
import { User } from "../models/userModel.js";
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
import callOpenAI from "../openai.js"

const ngrokUrl = "https://d648-110-227-193-66.ngrok-free.app"
const localUrl = "http://127.0.0.1:5555"

function generateOTP(length) {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

const generateToken = () => {
  return randomBytes(20).toString("hex");
};
  
// Usage example:
// const subject = "Reset Password";
// const recipientEmail = "abhirathdubey2804@gmail.com";
// const content = "This is a link to reset your password";

// sendEmail(subject, recipientEmail, content);

function isLoggedIn(request, response, next) {
  request.session.user || request.user ? next() : response.sendStatus(401);
}

const GOOGLE_CLIENT_ID =
  "176560673380-ofn0158e60l1kjoskprrtks3aprcuqol.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${localUrl}/accounts/google/callback`,
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      User.findOne({ email: profile.email }).then((user) => {
        if (!user) {
          user = new User({
            name: profile.given_name,
            email: profile.email,
            password: profile.id,
            isGoogle: true,
            googleId: profile.id,
          });
          user.save().then((err) => {
            if (err) console.log(err);
            done(null, user);
          });
        } else {
          console.log("Here");
          done(null, user);
        }
      });
    }
  )
);

const LINKEDIN_KEY = "77nj3cw8oqnf63";
const LINKEDIN_SECRET = "eAHcoO7xkTd9QveI";

passport.use(
  new LinkedInStrategy(
    {
      clientID: LINKEDIN_KEY,
      clientSecret: LINKEDIN_SECRET,
      callbackURL: `${localUrl}/accounts/linkedin/callback`,
      scope: ["email", "profile", "openid"],
    },
    function (accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        // To keep the example simple, the user's LinkedIn profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        User.findOne({ email: profile.email }).then((user) => {
          if (!user) {
            user = new User({
              name: profile.givenName,
              email: profile.email,
              password: profile.id,
              isLinkedin: true,
              linkedinId: profile.id,
            });
            user.save().then((err) => {
              if (err) console.log(err);
              // done(null, user)
            });
          } else {
            console.log("Here");
            // done(null, user)
          }
        });
        console.log(profile);
        return done(null, profile);
      });
    }
  )
);


passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async function (email, password, done) {
      const user = await User.findOne({ email });
      try {
        if (!user) return done(null, false);

        if (user.password !== password) return done(null, false);

        return done(null, user);
      } catch (error) {
        console.log("Error")
        return done(error, false);
      }
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// passport.use(User.createStrategy());
// Serve static files from the frontend directory
router.use(express.static(join(__dirname, "../", "frontend")));

router.get("/signup", (request, response) => {
  response.sendFile(join(__dirname, "../", "frontend", "accounts", "signup.html"));
});

router.get("/activation", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), async (request, response) => {
  const user = await User.findOne({ email: request.user.email });
  
  if (!user.isActivated) {
    
    // Generate a 6-digit OTP
    const otp = generateOTP(6);
    
    
    user.activationCode = otp
    await user.save()
    
    await sendEmail(
    "Account Activation",
    user.email,
    `Here's the code to activate your account <strong>${otp}</strong>`
    );
    
    response.sendFile(join(__dirname, "../", "frontend", "accounts", "activation.html"));
  } else {
    response.redirect("/panel/home")
  }
});

router.post("/activateaccount", async (request, response) => {
  const { otp } = request.body;
  const user = await User.findOne({ email: request.user.email });

  if (otp == user.activationCode) {
    user.activationCode = null
    user.isActivated = true
    user.save()

    response.status(200).send({ message: "Account Successfully Activated" })
  } else {
    response.status(201).send({message: "Invalid Activation Code"})
  }
})

async function validateToken(token, email) {
  const user = await User.findOne({ email: email, resetPasswordToken: token });

  if (user) {
    return true;
  } else {
    return false;
  }
}

// Step 4: Handle Reset Password Link
router.get("/reset-password", async (req, res) => {
  const { token } = req.query;
  const { email } = req.query;

  // Validate token
  const isValidToken = await validateToken(token, email);
  if (!isValidToken) {
    return res.status(400).send("Invalid token");
  }
  // Render reset password html
  res.sendFile(join(__dirname, "../", "frontend", "accounts", "resetpassword.html"), {
    token,
  });
});

// Step 5: Update Password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  // Validate token
  const isValidToken = validateToken(token);
  if (!isValidToken) {
    return res.status(400).send("Invalid token");
  }

  // Find user by token
  const user = await User.findOne({ resetPasswordToken: token });
  if (!user) {
    return res.status(404).send("User not found");
  }

  console.log("Gottt");

  // Update password
  user.password = password;
  user.resetPasswordToken = null; // Clear token
  await user.save();

  res.send("Password reset successfully");
});

// router.get("/reset-password", (request, response) => {
//     response.sendFile(join(__dirname, '../..', 'frontend', 'resetpassword.html'));
// });

router.get("/forgot-password", (request, response) => {
  response.sendFile(
    join(__dirname, "../", "frontend", "accounts", "forgotpassword.html")
  );
});

// Step 1: User Request Password Reset
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  // Step 2: Generate Token
  const token = generateToken();

  user.resetPasswordToken = token;
  await user.save();

  // Step 3: Send Reset Password Email
  await sendEmail(
    "Reset Password",
    user.email,
    `To reset your JobSound password, click <a href="${localUrl}/accounts/reset-password?token=${token}&email=${user.email}">here</a>`
  );
  // sendEmail(subject, recipientEmail, content)

  res.status(201).send({ message: "Reset password email sent successfully" });
});

// Route to save a User
router.post("/signup", async (request, response) => {
  try {
    if (!request.body.name || !request.body.company || !request.body.email || !request.body.password) {
      return response.status(400).send({
        message: "All fields are required.",
      });
    }
    const user = await User.findOne({ email: request.body.email });
    if (user) {
      response.status(400).send({ message: "Email already in use" });
    } else {
      const newUser = {
        name: request.body.name,
        company: request.body.company,
        email: request.body.email,
        password: request.body.password,
      };

      const createUser = await User.create(newUser);

      return response
        .status(201)
        .send({ message: "Account successfully created" });
    }
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/signin", (request, response) => {
  response.sendFile(join(__dirname, "../", "frontend", "accounts", "signin.html"));
});

router.post('/signin', passport.authenticate('local', { failureRedirect: '/' }),  function(req, res) {
  console.log(req.user)
  res.send(true)
	// res.redirect('/accounts/protected');
});

//Handling user login
router.post("/signin", async function (request, response) {
  console.log(request.body.email);
  console.log(request.body.password);
  try {
    if (!request.body.email || !request.body.password) {
      return response.send(400).send({
        message: "All fields are required.",
      });
    }
    const user = await User.findOne({ email: request.body.email });
    if (user) {
      const result = request.body.password === user.password;
      if (result) {
        request.session.user = user;

        response.status(201).send({ message: "Successfully logged in" });
      } else {
        response.status(400).send({ message: "Password does not match" });
      }
    } else {
      response.status(400).send({ message: "User does not exist" });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/linkedin",
  passport.authenticate("linkedin", { state: "SOME STATE" })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/accounts/activation",
    failureRedirect: "/accounts/google/failure",
  })
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/accounts/activation",
    failureRedirect: "/accounts/linkedin/failure",
  })
);

router.get("/google/failure", (request, response) => {
  response.send(
    "Something went wrong. <a href='/accounts/signin'>Try again</a>"
  );
});

router.get("/linkedin/failure", (request, response) => {
  response.send(
    "Something went wrong. <a href='/accounts/signin'>Try again</a>"
  );
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/protected", connectEnsureLogin.ensureLoggedIn("/accounts/signin"), (request, response) => {
  console.log(request.user);
  console.log(request.user.id);
  response.send("Hello!");
});

router.get("/profile", (request, response) => {
  request.session.authenticated = true;
  console.log(request.user)
  response.send(request.session.user);
});

export default router;
