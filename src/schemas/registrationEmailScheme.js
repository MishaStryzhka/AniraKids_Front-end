import * as Yup from 'yup';

export const validRegistrationEmailScheme = Yup.object().shape({
  email: Yup.string()
    .required('Поле обов`язкове')
    .email('Введіть дійсну адресу електронної пошти'),
  password: Yup.string()
    .required('Field is required')
    .min(6, 'Пароль повинен містити мінімум 6 символів')
    .max(16, 'Password must be less than 16 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,16}$/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
    ),
});
