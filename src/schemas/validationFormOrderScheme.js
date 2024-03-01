import * as Yup from 'yup';

export const validationFormOrderScheme = Yup.object().shape({
  fullName: Yup.string().required('Required field').max(64, 'nameLength'),
  phoneNumber: Yup.string()
    .required('Required field')
    .matches(/^\+[0-9]{12,}$/, 'Invalid phone number format'),
  email: Yup.string().required('Required field').email('validEmail'),
  city: Yup.string()
    .required('Required field')
    .matches(/^[a-zA-Z\u00C0-\u017F\s]+$/, 'Only Czech characters are allowed'),
  address: Yup.string()
    .required('Required field')
    .matches(
      /^[a-zA-Z\u00C0-\u017F\s]+\s\d+\/\d+$/,
      'Address must consist of letters, Czech characters, and digits in the format "street number/flat number"'
    ),
});
