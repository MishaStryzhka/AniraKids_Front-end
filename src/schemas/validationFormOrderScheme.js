import * as Yup from 'yup';

export const validationFormOrderScheme = Yup.object().shape({
  firstName: Yup.string().required('Required field'),
  lastName: Yup.string().required('Required field'),
  phoneNumber: Yup.string()
    .required('Required field')
    .matches(/^\+[0-9]{12,}$/, 'Invalid phone number format'),
  email: Yup.string().required('Required field').email('Invalid email format'),
  deliveryService: Yup.string().required('Required field'),
  // deliveryType: Yup.string().required('Required field'),
  // address: Yup.string()
  //   .required('Required field')
  //   .matches(
  //     /^[a-zA-Z\u00C0-\u017F\s]+\s\d+\/\d+$/,
  //     'Address must consist correct format `street number/flat number`'
  //   ),
});
