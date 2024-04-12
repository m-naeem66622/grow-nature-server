const Joi = require("joi");

const createSchema = Joi.object({
  offeredPlants: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required(),
  desiredPlants: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required(),
});

const idSchema = Joi.object({
  plantSwapId: Joi.string().hex().length(24).required(),
});

const getAllSchema = Joi.object({
  status: Joi.string().valid("PENDING", "COMPLETED").uppercase(),
  limit: Joi.number().min(1),
  page: Joi.number().min(1),
});

module.exports = { createSchema, idSchema, getAllSchema };
