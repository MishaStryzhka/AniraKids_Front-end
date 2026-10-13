import * as Yup from 'yup';

export const validUpdateEmailScheme = Yup.object().shape({
  email: Yup.string()
    .required('Toto pole je povinné.')
    .email('Zadejte platnou e-mailovou adresu.'),
});
