const Joi = require("joi");

const productSchema = Joi.object({
  src: Joi.array().items(Joi.string()).min(1).required(),
  name: Joi.string().required(),
  categories: Joi.array()
    .items(Joi.string())
    .min(1)
    .default(["Plant"])
    .required(),
  shortDesc: Joi.string().required(),
  price: Joi.object({
    amount: Joi.number().required(),
    currency: Joi.string().default("USD").required(),
  }).required(),
  potSize: Joi.object({
    size: Joi.number().min(1).default(null),
    unit: Joi.string().default(null),
  }).default(null),
  potType: Joi.string().default(null),
  longDesc: Joi.string().required(),
});

// Params validation for productId
const productIdValidate = Joi.object({
  productId: Joi.string().length(24).hex(),
});

const getProductsSchema = Joi.object({
  page: Joi.number().integer(),
  limit: Joi.number().integer(),
  categories: Joi.array().items(Joi.string()),
});

module.exports = {
  productSchema,
  productIdValidate,
  getProductsSchema,
};
