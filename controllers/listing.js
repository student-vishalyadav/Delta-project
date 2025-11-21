const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");

// INDEX
module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index", { allListing });
};

// NEW FORM
module.exports.rendernewform = (req, res) => {
  res.render("listings/new");
};

// SHOW LISTING
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// CREATE LISTING (FILE + URL)
module.exports.createlisting = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  try {
    // CASE 1 — File Upload
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // CASE 2 — URL Upload
    else if (req.body.listing.imageUrl) {
      try {
        const upload = await cloudinary.uploader.upload(
          req.body.listing.imageUrl,
          { folder: "Wanderlust" }
        );

        newListing.image = {
          url: upload.secure_url,
          filename: upload.public_id
        };
      } catch (err) {
        req.flash("error", "Invalid Image URL!");
        return res.redirect("/listings/new");
      }
    }

    // CASE 3 — No Image
    else {
      newListing.image = {
        url: "https://placehold.co/600x400?text=No+Image",
        filename: "default"
      };
    }

    await newListing.save();
    req.flash("success", "New Listing created!");
    return res.redirect("/listings");

  } catch (e) {
    req.flash("error", "Something went wrong!");
    return res.redirect("/listings/new");
  }
};

// EDIT FORM
module.exports.renderEditform = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

// UPDATE LISTING
module.exports.updatelisting = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // FILE upload
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  // URL upload
  else if (req.body.listing.imageUrl) {
    try {
      const upload = await cloudinary.uploader.upload(
        req.body.listing.imageUrl,
        { folder: "Wanderlust" }
      );

      listing.image = {
        url: upload.secure_url,
        filename: upload.public_id
      };

      await listing.save();
    } catch (err) {
      req.flash("error", "Invalid Image URL!");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  req.flash("success", "Listing updated successfully!");
  return res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.destroylisting = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted successfully!");
  return res.redirect("/listings");
};
