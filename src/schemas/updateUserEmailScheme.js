import * as Yup from 'yup';

export const validUpdateEmailScheme = Yup.object().shape({
  email: Yup.string()
    .required('Поле обов`язкове')
    .email('Введіть дійсну адресу електронної пошти'),
});
