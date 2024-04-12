const ALLOWED_VALIDATION_SCHEMA_SCOPES = {
  BODY: "BODY",
  PARAMS: "PARAMS",
  QUERY: "QUERY",
  NONE: "NONE",
};

const ALLOWED_VALID_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const USER_COMMON_PROJECTION = {
  firstName: 1,
  lastName: 1,
  email: 1,
  phoneNumber: 1,
  address: 1,
};

const PLANT_COMMON_PROJECTION = {
  name: 1,
  price: 1,
};

module.exports = {
  ALLOWED_VALIDATION_SCHEMA_SCOPES,
  ALLOWED_VALID_DAYS,
  USER_COMMON_PROJECTION,
  PLANT_COMMON_PROJECTION,
};
