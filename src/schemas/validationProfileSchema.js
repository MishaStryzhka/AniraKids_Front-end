import * as Yup from 'yup';

export const validationProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .matches(
      // eslint-disable-next-line no-useless-escape
      `^(?!.*[ЪЫЭъыэ])[а-яА-ЯіїєґІЇЄҐ -')]+$`,
      'Введено недопустимі символи. Введіть ім’я українською мовою.'
    )
    .required("Поле обов'язкове")
    .max(64, 'Ім’я має бути менше 64 символів'),
  lastName: Yup.string()
    .matches(
      // eslint-disable-next-line no-useless-escape
      `^(?!.*[ЪЫЭъыэ])[а-яА-ЯіїєґІЇЄҐ -')]+$`,
      'Введено недопустимі символи. Введіть прізвище українською мовою.'
    )
    .required('Поле обов`язкове')
    .max(64, 'Прізвище має бути менше 64 символів'),
  patronymic: Yup.string()
    .matches(
      // eslint-disable-next-line no-useless-escape
      `^(?!.*[ЪЫЭъыэ])[а-яА-ЯіїєґІЇЄҐ -')]+$`,
      'Введено недопустимі символи. Введіть по-батькові українською мовою.'
    )
    .max(64, 'По-батькові має бути менше 64 символів'),
  // ===========
  // nikname
  // ===========

  primaryPhoneNumber: Yup.string().when('isPhone', {
    is: true,
    then: Yup.string().required('Field is required'),
  }),
  email: Yup.string()
    .required('Поле обов`язкове')
    .email('Введіть дійсну адресу електронної пошти'),
  newPassword: Yup.string()
    .required('Поле обов`язкове')
    .min(8, 'Пароль має бути не менше 8 символів')
    .max(32, 'Пароль має бути менше 32 символів')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,16}$/,
      'Пароль повинен містити мінімум 8 латинських символів, одну велику літеру, одну цифру'
    ),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Паролі повинні збігатися')
    .required('Поле обов`язкове'),
});
