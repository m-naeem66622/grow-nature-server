const express = require("express");
const router = express.Router();

const Controller = require("../controllers/appointment.controller");
const { validateInput } = require("../middlewares/validateInput.middleware");
const Validation = require("../validators/appointment.validator");
const { authentication } = require("../middlewares/authentication.middleware");
const Authorize = require("../middlewares/authorization.middleware");

// Route for creating appointment
router.post(
  "/",
  validateInput(Validation.createSchema, "BODY"),
  authentication,
  Authorize.isBuyer,
  Controller.createAppointment
);

// Route for getting all appointments
router.get(
  "/",
  validateInput(Validation.getAllSchema, "QUERY"),
  authentication,
  Authorize.isCaretakerOrBuyer,
  Controller.getAllAppointments
);

// Route for getting appointment by id
router.get(
  "/:appointmentId",
  validateInput(Validation.idSchema, "PARAM"),
  authentication,
  Authorize.isCaretakerOrBuyer,
  Controller.getAppointmentById
);

// Route for updating appointment by id
router.patch(
  "/:appointmentId",
  validateInput(Validation.idSchema, "PARAM"),
  authentication,
  Authorize.isCaretakerOrBuyer,
  validateInput(Validation.updateSchema, "BODY"),
  Controller.updateAppointmentById
);

// Route for deleting appointment by id
router.delete(
  "/:appointmentId",
  validateInput(Validation.idSchema, "PARAM"),
  authentication,
  Authorize.isBuyer,
  Controller.deleteAppointmentById
);

module.exports = router;
