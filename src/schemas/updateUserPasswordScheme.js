import * as Yup from 'yup';

export const validPasswordScheme = Yup.object().shape({
  password: Yup.string()
    .required('Toto pole je povinné.')
    .min(8, 'Heslo musí mít alespoň 8 znaků.')
    .max(32, 'Heslo může mít nejvýše 32 znaků.')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,16}$/,
      'Heslo musí obsahovat alespoň 8 znaků, jedno velké písmeno latinky a jednu číslici.'
    ),
  newPassword: Yup.string()
    .required('Toto pole je povinné.')
    .min(8, 'Heslo musí mít alespoň 8 znaků.')
    .max(32, 'Heslo může mít nejvýše 32 znaků.')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,16}$/,
      'Heslo musí obsahovat alespoň 8 znaků, jedno velké písmeno latinky a jednu číslici.'
    ),
});
