// USERS ROUTE
const express = require("express");
const router = express.Router();

const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const users= require("../controllers/users");



// Render signup form
router.get("/signup", users.rendersignupform);

// Handle signup form
router.post("/signup", users.signup);




// Render login page
router.get("/login",users.loginrender);

// Login logic
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  users.login
);




router.get("/logout", users.logout);

module.exports = router;
