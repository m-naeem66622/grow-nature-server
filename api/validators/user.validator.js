const Joi = require("joi");

// Define Joi schema for user
const userValidationSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid("BUYER", "SELLER"),
  session: Joi.string().allow(null),
});

module.exports = userValidationSchema;
