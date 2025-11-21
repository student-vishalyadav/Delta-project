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

// ROUTES
const listings = require("./routes/listings");
const reviews = require("./routes/reviews");
const userRouter = require("./routes/user");

const app = express();

// DATABASE CONNECTION
async function main() {
  await mongoose.connect(process.env.ATLAS_URL);
}
main()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ DB connection error:", err));

// VIEW ENGINE SETUP
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// SESSION STORE
const store = MongoStore.create({
  mongoUrl: process.env.ATLAS_URL,
  ttl: 14 * 24 * 60 * 60,
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));

// FLASH
app.use(flash());

// PASSPORT AUTH
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GLOBAL FLASH + CURRENT USER
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// DEMO ROUTE
app.get("/demouser", async (req, res) => {
  try {
    const fakeUser = new User({
      email: "student@gmail.com",
      username: "delta-student",
    });

    const registeredUser = await User.register(fakeUser, "Helloworld");
    res.send(registeredUser);
  } catch (e) {
    res.send(e.message);
  }
});

// ROUTERS
app.use("/", userRouter);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// 404 ROUTE
app.all("*", (req, res) => {
  res.status(404).render("error", { message: "Page not found!" });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.log("🔥 ERROR →", err);
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error", { message });
});

// START SERVER
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
});
