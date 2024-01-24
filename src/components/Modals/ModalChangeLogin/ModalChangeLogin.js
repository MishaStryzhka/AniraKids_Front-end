import Button from 'components/Button/Button';
import {
  Form,
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangeLogin.styled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../../redux/auth/operations';
import { validUpdateLoginScheme } from 'schemas';
import { useTranslation } from 'react-i18next';

const ModalChangeLogin = ({ onClick }) => {
  const dispatch = useDispatch();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangeLogin',
  });

  const handleSubmitLogin = values => {
    const { login } = values;

    console.log(values);
    dispatch(updateUserInfo({ login }));
  };
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <Formik
        initialValues={{
          login: '',
        }}
        validationSchema={validUpdateLoginScheme}
        onSubmit={handleSubmitLogin}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit}>
            <ModalTitle>{t('changeLogin')}</ModalTitle>
            <LabelModal>
              {t('Login')}
              <InputModal
                value={values.login}
                name="login"
                onChange={e => {
                  console.log(e.target.value);
                  handleChange(e);
                }}
                placeholder="@nastia25"
              />
              <p>{errors.login && touched.login && errors.login}</p>
            </LabelModal>
            <Button type="submit">{t('Save')}</Button>
          </Form>
        )}
      </Formik>
    </ModalWindow>
  );
};

export default ModalChangeLogin;
