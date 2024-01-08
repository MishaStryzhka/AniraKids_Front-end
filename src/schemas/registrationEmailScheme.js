import * as Yup from 'yup';

export const validRegistrationEmailScheme = Yup.object().shape({
  email: Yup.string()
    .required('Поле обов`язкове')
    .email('Введіть дійсну адресу електронної пошти'),
  password: Yup.string()
    .required('Field is required')
    .min(8, 'Пароль має бути не менше 8 символів')
    .max(32, 'Пароль має бути менше 32 символів')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,16}$/,
      'Пароль повинен містити мінімум 8 латинських символів, одну велику літеру, одну цифру'
    ),
});
