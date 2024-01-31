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
const {
  validationBillingDetailsScheme,
} = require('./validationBillingDetailsScheme');
const {
  validationBankAccountScheme,
} = require('./validationBankAccountScheme');

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
  validationBillingDetailsScheme,
  validationBankAccountScheme,
};
