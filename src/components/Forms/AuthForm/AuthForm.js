import { Formik } from 'formik';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logIn } from '../../../redux/auth/operations';
import {
  Button,
  Description,
  FieldStyled,
  Form,
  Label,
  StyledNavLink,
  TitleLogin,
  Wrap,
  WrapIcon,
} from './AuthForm.styled';
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { validationAuthorizationScheme } from 'schemas';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../Form.styled';
import { BeatLoader } from 'react-spinners';

const AuthForm = ({ handleCloseModal }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.authForm',
  });
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme, isLoading } = useAuth();
  let { error } = useAuth();

  console.log('error', error);

  const handleOpenPassword = () => {
    setOpenPassword(openPassword => !openPassword);
  };

  const handleAuthSubmit = values => {
    const { login, password } = values;

    console.log(values);
    dispatch(logIn({ login, password }));
  };
  return (
    <>
      <Formik
        initialValues={{
          login: '',
          password: '',
        }}
        validationSchema={validationAuthorizationScheme}
        validateOnChange={false}
        onSubmit={handleAuthSubmit}
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
            <Description>{t('description')}</Description>
            <TitleLogin>{t('login')}</TitleLogin>
            <Wrap>
              <Label>
                {t('login')}
                <FieldStyled
                  placeholder={t('placeholderLogin')}
                  onChange={e => {
                    error = null;
                    handleChange(e);
                  }}
                  name="login"
                  value={values.login}
                  required
                />
                <ErrorMessage>
                  {errors.login && touched.login && t(errors.login)}
                </ErrorMessage>
              </Label>
              <Label>
                {t('password')}
                <FieldStyled
                  type={openPassword ? 'text' : 'password'}
                  name="password"
                  onChange={e => {
                    error = null;
                    handleChange(e);
                  }}
                  value={values.password}
                  placeholder="****"
                  required
                />
                <ErrorMessage>
                  {(errors.password &&
                    touched.password &&
                    t(errors.password)) ||
                    (error?.message === 'login or password is wrong' &&
                      t(error?.message))}
                </ErrorMessage>
                <WrapIcon onClick={handleOpenPassword}>
                  {openPassword ? (
                    <IconEyeOpen fill={theme[currentTheme].color.mainColor2} />
                  ) : (
                    <IconEyeClosed
                      fill={theme[currentTheme].color.mainColor2}
                    />
                  )}
                </WrapIcon>
              </Label>
            </Wrap>
            <StyledNavLink
              to="/refreshPassword"
              onClick={() => handleCloseModal()}
            >
              {t('forgotPassword')}
            </StyledNavLink>
            <Button type="submit" disabled={isLoading}>
              {!isLoading ? t('submitButton') : <BeatLoader color="#fff" />}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AuthForm;
