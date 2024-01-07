import * as Yup from 'yup';

export const validUpdateLoginScheme = Yup.object().shape({
  login: Yup.string()
    .required('Поле обов`язкове')
    .min(6, 'Повинно бути мінімум 6 символів')
    .max(24, 'Повинно бути максимум 24 символів')
    .matches(
      /^[@\w\d!#$%^&*()_+{}\\[\]:;<>,.?~\\/-]+$/,
      'Повинно містити літери, цифри та спеціальні знаки'
    ),
});
