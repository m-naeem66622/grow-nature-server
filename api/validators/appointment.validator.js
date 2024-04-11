const Joi = require("joi");

const createSchema = Joi.object({
  start: Joi.date().min("now").required(),
  end: Joi.date().greater(Joi.ref("start")).required(),
  caretaker: Joi.string().hex().length(24).required(),
  purpose: Joi.string().required(),
});

const idSchema = Joi.object({
  appointmentId: Joi.string().hex().length(24).required(),
});

const getAllSchema = Joi.object({
  start: Joi.date(),
  end: Joi.date().when("start", {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref("start")),
    otherwise: Joi.date(),
  }),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").uppercase(),
  limit: Joi.number().min(1),
  page: Joi.number().min(1),
});

const updateSchema = Joi.object({
  start: Joi.date().when("$role", {
    is: "CARETAKER",
    then: Joi.forbidden(),
    otherwise: Joi.date().min("now"),
  }),
  end: Joi.date().when("$role", {
    is: "CARETAKER",
    then: Joi.forbidden(),
    otherwise: Joi.date().greater(Joi.ref("start")),
  }),
  status: Joi.string().when("$role", {
    is: "CARETAKER",
    then: Joi.string().valid("PENDING", "APPROVED", "REJECTED").uppercase(),
    otherwise: Joi.forbidden(),
  }),
  purpose: Joi.when("$role", {
    is: "CARETAKER",
    then: Joi.forbidden(),
    otherwise: Joi.string(),
  }),
})
  .with("start", "end")
  .with("end", "start")
  .messages({
    "object.with": "start and end must be provided together",
  });

module.exports = {
  createSchema,
  idSchema,
  getAllSchema,
  updateSchema,
};
