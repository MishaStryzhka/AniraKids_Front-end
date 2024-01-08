import * as Yup from 'yup';

export const validPhoneNumberScheme = Yup.object().shape({
  primaryPhoneNumber: Yup.string()
    .required('Field is required')
    .matches(/^\+380[0-9]{9}$/, 'Invalid phone number format'),
});
