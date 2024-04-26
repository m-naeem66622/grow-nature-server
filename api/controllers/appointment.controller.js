const axios = require("axios");
const Appointment = require("../models/appointment.model");
const { throwError } = require("../helpers/error");
const { USER_COMMON_PROJECTION } = require("../../config/config");
const generateMongoId = require("../helpers/generateMongoId");

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointment
 * @access  Private/Customer
 */
const createAppointment = async (req, res, next) => {
  try {
    const customerId = req.decodedToken._id;
    const { caretaker, start, end, price } = req.body;

    // Check appointment availability
    const isAvailable = await Appointment.checkAvailability(
      caretaker,
      start,
      end
    );

    if (isAvailable.status === "FAILED") {
      throwError(
        isAvailable.status,
        isAvailable.error.statusCode,
        isAvailable.error.message,
        isAvailable.error.identifier
      );
    }

    // Get Access Token from PayFast
    const appointmentId = generateMongoId();
    let payfastAcessToken = null;
    try {
      const response = await axios.post(
        `https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken?MERCHANT_ID=${process.env.PAYFAST_MERCHANT_ID}&SECURED_KEY=${process.env.PAYFAST_SECURED_KEY}&BASKET_ID=${appointmentId}&TXNAMT=${price}`
      );

      if (response.data.ACCESS_TOKEN) {
        payfastAcessToken = response.data.ACCESS_TOKEN;
      }
    } catch (error) {
      throwError(
        "FAILED",
        422,
        "Error getting PayFast Access Token",
        "0x000D83"
      );
    }

    req.body.customer = customerId;
    req.body._id = appointmentId;
    const newAppointment = await Appointment.createAppointment(req.body);

    if (newAppointment.status === "FAILED") {
      throwError(
        newAppointment.status,
        newAppointment.error.statusCode,
        newAppointment.error.message,
        newAppointment.error.identifier
      );
    }

    // soft delete fields
    newAppointment.data.isDeleted = undefined;

    res.status(201).json({
      status: "SUCCESS",
      message: "Appointment created successfully",
      data: newAppointment.data,
      formParams: {
        MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
        MERCHANT_NAME: process.env.PAYFAST_MERCHANT_NAME,
        TOKEN: payfastAcessToken,
        PROCCODE: "00",
        TXNAMT: price,
        CURRENCY_CODE: "PKR",
        BASKET_ID: appointmentId,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments
 * @route   GET /api/appointment
 * @access  Private/Customer, Caretaker
 */
const getAllAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, start, end, ...restQuery } = req.query;
    const filter = { isDeleted: false, ...restQuery };
    const projection = {
      root: { isDeleted: 0 },
      customer: USER_COMMON_PROJECTION,
      caretaker: { ...USER_COMMON_PROJECTION, services: 1 },
    };

    if (start) filter.start = { $gte: new Date(start) };
    if (end) filter.end = { $lte: new Date(end) };

    // Ensure that only the user's own appointments are returned
    const userRole = req.decodedToken.role;
    if (userRole === "BUYER") filter.customer = req.decodedToken._id;
    if (userRole === "CARETAKER") filter.caretaker = req.decodedToken._id;

    const totalAppointments = await Appointment.countAppointments(filter);
    const appointments = await Appointment.getAppointments(
      filter,
      projection,
      page,
      limit
    );

    if (appointments.status === "FAILED") {
      throwError(
        appointments.status,
        appointments.error.statusCode,
        appointments.error.message,
        appointments.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      pagination: {
        totalPages: Math.ceil(totalAppointments.data / limit),
        currentPage: page,
        totalAppointments: totalAppointments.data,
        currentAppointments: appointments.data.length,
        limit,
      },
      data: appointments.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointment by id
 * @route   GET /api/appointment/:appointmentId
 * @access  Private/Customer, Caretaker
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const filter = { _id: appointmentId, isDeleted: false };
    const projection = {
      root: { isDeleted: 0 },
      nested: USER_COMMON_PROJECTION,
    };

    // Ensure that only the user's own appointments are returned
    const userRole = req.decodedToken.role;
    if (userRole === "BUYER") filter.customer = req.decodedToken._id;
    if (userRole === "CARETAKER") filter.caretaker = req.decodedToken._id;

    const appointment = await Appointment.getAppointment(filter, projection);

    if (appointment.status === "FAILED") {
      throwError(
        appointment.status,
        appointment.error.statusCode,
        appointment.error.message,
        appointment.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      data: appointment.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment by id
 * @route   PUT /api/appointment/:appointmentId
 * @access  Private/Customer, Caretaker
 */
const updateAppointmentById = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const filter = { _id: appointmentId, isDeleted: false };
    const options = { fields: { isDeleted: 0 } }; // exclude isDeleted field

    // Ensure that only the user's own appointments are returned
    const userRole = req.decodedToken.role;
    if (userRole === "BUYER") filter.customer = req.decodedToken._id;
    if (userRole === "CARETAKER") filter.caretaker = req.decodedToken._id;

    const appointment = await Appointment.getAppointment(filter);

    if (appointment.status === "FAILED") {
      throwError(
        appointment.status,
        appointment.error.statusCode,
        appointment.error.message,
        appointment.error.identifier
      );
    }

    // Avoid the update changes if appointment is approved (not applicable for caretaker)
    if (
      req.decodedToken.role !== "CARETAKER" &&
      appointment.data.status === "APPROVED"
    ) {
      throwError(
        "FAILED",
        422,
        "Appointment is already approved, cannot be update",
        "0x000D81"
      );
    }

    // Check availability with updated changes
    const isAvailable = await Appointment.checkAvailability(
      appointment.data.caretaker,
      req.body.start || appointment.data.start,
      req.body.end || appointment.data.end,
      appointmentId
    );

    if (isAvailable.status === "FAILED") {
      throwError(
        isAvailable.status,
        isAvailable.error.statusCode,
        isAvailable.error.message,
        isAvailable.error.identifier
      );
    }

    // Reset the status to PENDING if the start or end time is updated
    if (req.body.start || req.body.end) req.body.status = "PENDING";

    const updatedAppointment = await Appointment.updateAppointment(
      filter,
      req.body,
      options
    );

    if (updatedAppointment.status === "FAILED") {
      throwError(
        updatedAppointment.status,
        updatedAppointment.error.statusCode,
        updatedAppointment.error.message,
        updatedAppointment.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      message: "Appointment updated successfully",
      data: updatedAppointment.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete appointment by id
 * @route   DELETE /api/appointment/:appointmentId
 * @access  Private/Customer
 */
const deleteAppointmentById = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const customerId = req.decodedToken._id;

    const filter = { _id: appointmentId, isDeleted: false };
    const appointment = await Appointment.getAppointment(filter);

    if (appointment.status === "FAILED") {
      throwError(
        appointment.status,
        appointment.error.statusCode,
        appointment.error.message,
        appointment.error.identifier
      );
    }

    // If the appointment is already approved, it cannot be deleted
    if (appointment.data.status === "APPROVED") {
      throwError(
        "FAILED",
        422,
        "Appointment is already approved, cannot be deleted",
        "0x000D82"
      );
    }

    const options = { new: true, fields: { isDeleted: 1 } };
    const deletedAppointment = await Appointment.deleteAppointment(
      appointmentId,
      customerId,
      options
    );

    if (deletedAppointment.status === "FAILED") {
      throwError(
        deletedAppointment.status,
        deletedAppointment.error.statusCode,
        deletedAppointment.error.message,
        deletedAppointment.error.identifier
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
};
