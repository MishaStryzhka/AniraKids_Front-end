const { validationProfileSchema } = require('./validationProfileSchema');
const { validRegistrationEmailScheme } = require('./registrationEmailScheme');

const {
  validRegistrationPhoneNumberScheme,
} = require('./registrationPhoneNumberScheme');

const { validationAuthorizationScheme } = require('./userAuthorizationScheme');

const { validUpdateEmailScheme } = require('./updateUserEmailScheme');
const { validUpdateLoginScheme } = require('./updateUserLoginScheme');
const { validPhoneNumberScheme } = require('./updateUserPhoneNumberScheme');
const { validPasswordScheme } = require('./updateUserPasswordScheme');
const { validationProductSchema } = require('./validationProductScheme');

module.exports = {
  validationProfileSchema,
  validRegistrationEmailScheme,
  validRegistrationPhoneNumberScheme,
  validationAuthorizationScheme,
  validUpdateEmailScheme,
  validUpdateLoginScheme,
  validPhoneNumberScheme,
  validPasswordScheme,
  validationProductSchema,
};
