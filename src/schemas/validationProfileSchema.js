import * as Yup from 'yup';

export const validationProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('fieldIsRequired').min(3, 'Zadejte alespoň 3 znaky.').max(64, 'nameLength'),
  lastName: Yup.string().required('fieldIsRequired').min(3, 'Zadejte alespoň 3 znaky.').max(64, 'surnameLength'),
  patronymic: Yup.string().max(64, 'patronymicLength'),
  nickname: Yup.string()
    .required('fieldIsRequired')
    .matches(/^@([a-zA-Z0-9_.-]+)$/, 'latinCharacters'),

  primaryPhoneNumber: Yup.string().matches(/^\+\d{2,15}$/, { message: 'Zadejte telefon s předvolbou, například +420777123456.', excludeEmptyString: true }),
  email: Yup.string().required('fieldIsRequired').email('validEmail'),
  newPassword: Yup.string()
    .min(8, 'passwordMinLength')
    .max(32, 'passwordMaxLength')
    .matches(/^(?=.*[A-Z])(?=.*\d).{8,16}$/, { message: 'passwordRequirements', excludeEmptyString: true }),
  confirmNewPassword: Yup.string()
    .when('newPassword', {
      is: newPassword => newPassword && newPassword.length > 0,
      then: () => Yup.string().required('fieldIsRequired'),
    })
    .oneOf([Yup.ref('newPassword'), null], 'passwordsMatch'),
});
