import * as Yup from 'yup';

export const validationProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("Поле обов'язкове")
    .max(64, 'Ім’я має бути менше 64 символів'),
  lastName: Yup.string()
    .required('Поле обов`язкове')
    .max(64, 'Прізвище має бути менше 64 символів'),
  patronymic: Yup.string().max(64, 'По-батькові має бути менше 64 символів'),
  nickname: Yup.string()
    .required('Поле обов`язкове')
    .matches(
      /^@([a-zA-Z0-9_-]+)$/,
      'Дозволені лише латинські літери, цифри, тире і підкреслення'
    ),

  primaryPhoneNumber: Yup.string().when('isPhone', {
    is: true,
    then: Yup.string().required('Field is required'),
  }),
  email: Yup.string()
    .required('Поле обов`язкове')
    .email('Введіть дійсну адресу електронної пошти'),
  newPassword: Yup.string()
    .min(8, 'Пароль має бути не менше 8 символів')
    .max(32, 'Пароль має бути менше 32 символів')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,16}$/,
      'Пароль повинен містити мінімум 8 латинських символів, одну велику літеру, одну цифру'
    ),
  confirmNewPassword: Yup.string()
    .when('newPassword', {
      is: newPassword => newPassword && newPassword.length > 0,
      then: Yup.string().required('Поле обов`язкове'),
    })
    .oneOf([Yup.ref('newPassword'), null], 'Паролі повинні збігатися'),
});
