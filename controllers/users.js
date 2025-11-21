const User = require("../models/user");   // <-- REQUIRED FIX

module.exports.rendersignupform = (req, res) => {
  res.render("users/signup");
}

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    // Auto-login after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });

  } catch (e) {

    if (e.code === 11000) {
      req.flash("error", "Email already registered! Please log in.");
      return res.redirect("/login");
    }

    if (e.name === "UserExistsError") {
      req.flash("error", "Username already exists! Try logging in.");
      return res.redirect("/login");
    }

    req.flash("error", "Invalid signup details!");
    res.redirect("/signup");
  }
}

module.exports.loginrender = (req, res) => {
  res.render("users/login");
}

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
}
