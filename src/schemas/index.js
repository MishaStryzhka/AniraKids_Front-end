const { validationProfileSchema } = require('./validationProfileSchema');
const { validRegistrationEmailScheme } = require('./registrationEmailScheme');

const {
  validRegistrationPhoneNumberScheme,
} = require('./registrationPhoneNumberScheme');

const { validationAuthorizationScheme } = require('./userAuthorizationScheme');

const { validUpdateEmailScheme } = require('./updateUserEmailScheme');
const { validUpdateLoginScheme } = require('./updateUserLoginScheme');

module.exports = {
  validationProfileSchema,
  validRegistrationEmailScheme,
  validRegistrationPhoneNumberScheme,
  validationAuthorizationScheme,
  validUpdateEmailScheme,
  validUpdateLoginScheme,
};
