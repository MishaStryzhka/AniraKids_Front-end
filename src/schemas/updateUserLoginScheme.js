import * as Yup from 'yup';

export const validUpdateLoginScheme = Yup.object().shape({
  login: Yup.string()
    .required('Toto pole je povinné.')
    .min(6, 'Zadejte alespoň 6 znaků.')
    .max(24, 'Zadejte nejvýše 24 znaků.')
    .matches(
      /^[@\w\d!#$%^&*()_+{}\\[\]:;<>,.?~\\/-]+$/,
      'Použijte písmena latinky, číslice nebo povolené speciální znaky.'
    ),
});
