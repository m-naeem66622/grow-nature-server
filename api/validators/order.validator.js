const Joi = require("joi");

const orderItemSchema = Joi.object({
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
  product: Joi.string().hex().length(24).required(),
});

const orderSchema = Joi.object({
  buyer: Joi.string().required(),
  orderItems: Joi.array().items(orderItemSchema),
  itemsPrice: Joi.number().required().default(0.0),
  taxPrice: Joi.number().required().default(0.0),
  shippingPrice: Joi.number().required().default(0.0),
  totalPrice: Joi.number().required().default(0.0),
  status: Joi.string()
    .valid("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED")
    .uppercase()
    .default("PENDING"),
});

const getSingleSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const getAllSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED")
    .uppercase(),
  buyer: Joi.string().hex().length(24),
  limit: Joi.number().integer().min(1).default(10),
  page: Joi.number().integer().min(1).default(1),
  sort: Joi.string().valid("asc", "desc").default("asc"),
});

const updateSchema = Joi.object({
  status: Joi.string()
    .uppercase()
    .when("$role", {
      is: "ADMIN",
      then: Joi.valid(
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ).required(),
      otherwise: Joi.valid("CANCELLED").required(),
    }),
});

module.exports = { orderSchema, getAllSchema, getSingleSchema, updateSchema };
