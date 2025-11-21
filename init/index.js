const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing");

main()
  .then(() => {
    console.log("✅ Database connected successfully");
    return initDB(); // only call once, after connection
  })
  .catch((err) => console.log("❌ Connection error:", err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/anulust");
}

const initDB = async () => {
  try {
    // Clear old data
    await Listing.deleteMany({});
    console.log("🧹 Old data deleted");

    // Add owner to each listing
    const ownerId = "690e1d539e4bbf8829f478ba"; // replace with a real user _id from your DB
    const listingsWithOwner = initData.data.map((obj) => ({
      ...obj,
      owner: ownerId,
    }));

    // Insert new data
    await Listing.insertMany(listingsWithOwner);
    console.log("✅ Data initialized successfully!");

  } catch (err) {
    console.log("❌ Error initializing data:", err);
  } finally {
    mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
};
