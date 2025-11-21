const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapasync = require("../utils/wrapasync");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { validateReview, isloggedIn, isReviewAuthor } = require("../middleware");
const review= require('../controllers/reviews');

// ✅ CREATE REVIEW
router.post("/", isloggedIn, validateReview, wrapasync(review.postroute));

// ✅ DELETE REVIEW (Author check added)
router.delete("/:reviewId", isloggedIn, isReviewAuthor, wrapasync(review.destroyReview));

module.exports = router;
