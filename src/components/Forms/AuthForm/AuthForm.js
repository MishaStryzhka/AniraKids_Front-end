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

const AuthForm = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

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
                  onChange={e => handleChange(e)}
                  name="login"
                  value={values.login}
                  required
                />
                <p>{errors.login && touched.login && errors.login}</p>
              </Label>
              <Label>
                {t('password')}
                <FieldStyled
                  type={openPassword ? 'text' : 'password'}
                  name="password"
                  onChange={e => handleChange(e)}
                  value={values.password}
                  placeholder="****"
                  required
                />
                <p>{errors.password && touched.password && errors.password}</p>
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
            <StyledNavLink>{t('forgotPassword')}</StyledNavLink>
            <Button type="submit">{t('submitButton')}</Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AuthForm;
