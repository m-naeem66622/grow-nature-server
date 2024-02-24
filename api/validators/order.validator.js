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
    .valid("PENDING", "SHIPPED", "DELIVERED")
    .uppercase()
    .default("PENDING"),
});

module.exports = { orderSchema };
