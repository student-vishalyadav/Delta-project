const Joi = require("joi");


// ----------------------
// ⭐ LISTING SCHEMA
// ----------------------
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),

    // ⭐ Allow image file (multer) OR URL
    imageUrl: Joi.string().uri().allow(null, ""),  
    image: Joi.any()
  }).required()
});


// ----------------------
// ⭐ REVIEW SCHEMA (FIX ADDED HERE)
// ----------------------
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required()
  }).required()
});
