const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// ✅ Use capital S for Schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// ✅ Use passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose);

// ✅ Correct export
module.exports = mongoose.model("User", userSchema);
