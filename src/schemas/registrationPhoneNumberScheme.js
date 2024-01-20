import * as Yup from 'yup';

export const validRegistrationPhoneNumberScheme = Yup.object().shape({
  primaryPhoneNumber: Yup.string()
    .required('Required field')
    .matches(/^\+[0-9]{12,}$/, 'Invalid phone number format'),
  password: Yup.string()
    .required('Required field')
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be less than 32 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,16}$/,
      'Password must contain at least 8 Latin characters, one uppercase letter, one digit'
    ),
});
