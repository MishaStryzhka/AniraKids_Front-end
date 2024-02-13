import * as Yup from 'yup';

export const validationBillingDetailsScheme = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .matches(
      /^[a-zA-Z\u00C0-\u017F\s.]+$/,
      'Only Czech characters are allowed'
    ),
  street: Yup.string()
    .required('Street is required')
    .matches(
      /^[a-zA-Z\u00C0-\u017F\s]+\s\d+\/\d+$/,
      'Only Czech characters and digits are allowed'
    ),
  city: Yup.string()
    .required('City is required')
    .matches(/^[a-zA-Z\u00C0-\u017F\s]+$/, 'Only Czech characters are allowed'),
  zip: Yup.string()
    .required('ZIP code is required')
    .matches(/^\d{5}$/, 'Invalid ZIP code'),
  сountry: Yup.string().oneOf(['Česká republika']).default('Česká republika'), // Устанавливаем значение по умолчанию
  vatMode: Yup.string()
    .oneOf(
      ['non_vat_payer', 'identified_person', 'vat_payer'],
      'Invalid VAT Mode'
    )
    .default('non_vat_payer') // Устанавливаем значение по умолчанию
    .required('VAT Mode is required'),
  companyID: Yup.string().matches(
    /^[a-zA-Z\u00C0-\u017F\s\d]+$/,
    'Only Czech characters and digits are allowed'
  ),
  VATID: Yup.string().matches(
    /^[a-zA-Z\u00C0-\u017F\s\d]+$/,
    'Only Czech characters and digits are allowed'
  ),
});
