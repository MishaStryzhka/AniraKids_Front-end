import * as Yup from 'yup';

export const validationAuthorizationScheme = Yup.object().shape({
  login: Yup.string()
    .required('Required field')
    .matches(/^([^\s@]+@[^\s@]+\.[^\s@]+|\+\d{12})$/, 'validLogin'),
  password: Yup.string().required('Required field'),
});
