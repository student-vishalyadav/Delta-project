const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapasync = require("../utils/wrapasync");
const { isloggedIn, isOwner, validatelisting } = require("../middleware");
const listingController = require("../controllers/listing");

const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/")
  .get(wrapasync(listingController.index))
  .post(
    isloggedIn,
    upload.single("listing[image]"),
    validatelisting,
    wrapasync(listingController.createlisting)
  );

router.get("/new", isloggedIn, listingController.rendernewform);

router.get("/:id", wrapasync(listingController.showListing));

router.get("/:id/edit",
  isloggedIn,
  isOwner,
  wrapasync(listingController.renderEditform)
);

router.put("/:id",
  isloggedIn,
  isOwner,
  upload.single("listing[image]"),
  validatelisting,
  wrapasync(listingController.updatelisting)
);

router.delete("/:id",
  isloggedIn,
  isOwner,
  wrapasync(listingController.destroylisting)
);

module.exports = router;
