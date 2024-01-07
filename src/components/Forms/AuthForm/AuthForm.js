import validationAuthorizationScheme from 'components/ValidationSchemas/AuthorizationScheme';
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

const AuthForm = () => {
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

  const handleOpenPassword = () => {
    setOpenPassword(openPassword => !openPassword);
  };

  const handleAuthSubmit = values => {
    const { login, password } = values;
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
            <Description>
              Авторизуйтеся за допомогою логіну (введіть номер телефону або
              електорнну пошту)
            </Description>
            <TitleLogin>Login</TitleLogin>
            <Wrap>
              <Label>
                Логін
                <FieldStyled
                  placeholder="Email / Номер телефону"
                  onChange={handleChange}
                  name="login"
                  value={values.login || ''}
                  required
                />
                <p>{errors.login && touched.login && errors.login}</p>
              </Label>
              <Label>
                Пароль
                <FieldStyled
                  type={openPassword ? 'text' : 'password'}
                  name="password"
                  onChange={handleChange}
                  value={values.password || ''}
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
            <StyledNavLink>Я забув (-ла) свій пароль</StyledNavLink>
            <Button type="submit" onSubmit={handleAuthSubmit}>
              Увійти
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AuthForm;
