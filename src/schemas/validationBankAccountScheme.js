import * as Yup from 'yup';

export const validationBankAccountScheme = Yup.object().shape({
  accountName: Yup.string().required('Account name is required'),
  accountNumber: Yup.string()
    .required('Account number is required')
    .matches(
      /^\d{10}\/\d{4}$/,
      'Invalid account number format (e.g., 1234567890/2010)'
    ),
  IBAN: Yup.string()
    .required('IBAN is required')
    .matches(
      /^[A-Z]{2}\d{2}[A-Z\d]{11,30}$/,
      'Invalid IBAN format (e.g., CZ6508000000192000145399)'
    ),
  swiftBIC: Yup.string()
    .required('SWIFT/BIC is required')
    .matches(
      /^[A-Z]{6}[A-Z\d]{2}([A-Z\d]{3})?$/,
      'Invalid SWIFT/BIC format (e.g., KOMBCZPP)'
    ),
  currency: Yup.string(),
});
