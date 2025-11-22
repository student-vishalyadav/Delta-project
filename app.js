const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
require("dotenv").config();

const listings = require("./routes/listings");
const reviews = require("./routes/reviews");
const userRouter = require("./routes/user");

const app = express();


// 🔥 DATABASE CONNECTION

async function main() {
  await mongoose.connect(process.env.ATLAS_URL);
}
main()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.log("❌ DB ERROR:", err));

// VIEW ENGINE

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// MIDDLEWARE

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// 🔥 FIXED SESSION STORE FOR RENDER

const store = MongoStore.create({
  mongoUrl: process.env.ATLAS_URL,
  touchAfter: 24 * 3600, // 24 hours
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR:", e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());


// PASSPORT AUTH

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// GLOBAL VARIABLES

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


// HOME ROUTE

app.get("/", (req, res) => {
  res.redirect("/listings");
});


// DEMO USER (optional)

app.get("/demouser", async (req, res) => {
  try {
    const user = new User({
      email: "student@gmail.com",
      username: "delta-student",
    });
    const registeredUser = await User.register(user, "Helloworld");
    res.send(registeredUser);
  } catch (err) {
    res.send(err.message);
  }
});


// ROUTES

app.use("/", userRouter);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


// 404 PAGE

app.all("*", (req, res) => {
  res.status(404).render("error", { message: "Page Not Found!" });
});


// GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {
  console.log("🔥 ERROR:", err);
  res.status(500).render("error", { message: err.message || "Something went wrong" });
});


// START SERVER

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
});
