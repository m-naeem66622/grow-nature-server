const Joi = require("joi");

// Define Joi schema for user
const createUserSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  address: Joi.object({
    country: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    street: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().required(),
  }).required(),
  password: Joi.string().required(),
  role: Joi.string().valid("BUYER", "SELLER"),
  session: Joi.string().allow(null),
});

const createCaretakerSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  address: Joi.object({
    country: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    street: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().required(),
  }).required(),
  password: Joi.string().required(),
  role: Joi.string().valid("CARETAKER"),
  session: Joi.string().allow(null),
  bio: Joi.string().required(),
  experience: Joi.array().items(Joi.string()).min(1).required(),
  speciality: Joi.string().required(),
  pricing: Joi.array()
    .items(
      Joi.object({
        service: Joi.string().required(),
        price: Joi.number().required(),
      })
    )
    .min(1)
    .required(),
  services: Joi.array().items(Joi.string()).min(1).required(),
  availability: Joi.array()
    .items(
      Joi.object({
        day: Joi.string().required(),
        start: Joi.date().required(),
        end: Joi.date().required(),
      })
    )
    .min(1)
    .required(),
});

const getUsersSchema = Joi.object({
  role: Joi.string().uppercase().valid("BUYER", "CARETAKER"),
  limit: Joi.number().min(1),
  page: Joi.number().min(1),
});

const updateUserSchema = Joi.object({
  isBlocked: Joi.boolean(),
});

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().required(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().trim(),
});

const idSchema = Joi.object({
  id: Joi.string().length(24).hex(),
});

const getReviewsSchema = Joi.object({
  page: Joi.number().integer(),
  limit: Joi.number().integer(),
});

module.exports = {
  createUserSchema,
  createCaretakerSchema,
  getUsersSchema,
  updateUserSchema,
  createReviewSchema,
  updateReviewSchema,
  idSchema,
  getReviewsSchema,
};
