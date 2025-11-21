const Listing = require("../models/listing");
const Review = require("../models/review");



module.exports.postroute = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;  // ✅ logged-in user
  await newReview.save();

  listing.reviews.push(newReview);
  await listing.save();

  req.flash("success", "New Review created!");
  res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}