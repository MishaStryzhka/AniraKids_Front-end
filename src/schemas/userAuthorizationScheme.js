import * as Yup from 'yup';

export const validationAuthorizationScheme = Yup.object().shape({
  login: Yup.string()
    .required('Field is required')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$|^\+?[0-9]+$/,
      'Enter a valid LogIn (email or valid phone number)'
    ),
  password: Yup.string()
    .required('Field is required')
    .min(6, 'Password must be at least 6 characters')
    .max(16, 'Password must be less than 16 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,16}$/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
    ),
});
