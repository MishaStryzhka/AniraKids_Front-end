import { useDispatch } from 'react-redux';
import { register } from '../../../redux/auth';
import { Formik } from 'formik';
import { validRegistrationEmailScheme } from 'components/ValidationSchemas/RegistrationSchemas';
import { useState } from 'react';
import {
  Button,
  FieldStyled,
  Form,
  Label,
  StyledNavLinkCondition,
  TextCondition,
  WrapIcon,
} from './FormRegistrationEmail.styled';
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useAuth } from 'hooks';

const FormRegistrationEmail = () => {
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

  const handleOpenPassword = () => {
    setOpenPassword(openPassword => !openPassword);
  };

  const handleRegistrationEmailSubmit = values => {
    const { email, password } = values;
    dispatch(register({ email, password }));
  };

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={validRegistrationEmailScheme}
        validateOnChange={false}
        onSubmit={handleRegistrationEmailSubmit}
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
            <Label>
              Email
              <FieldStyled
                // type="email"
                name="email"
                onClick={handleChange}
                value={values.email}
                placeholder="***@gmail"
                required
              />
              <p>{errors.email && touched.email && errors.email}</p>
            </Label>
            <Label>
              Пароль
              <FieldStyled
                placeholder="****"
                type={openPassword ? 'text' : 'password'}
                name="password"
                onClick={handleChange}
                value={values.password}
                required
              />
              <p>{errors.password && touched.password && errors.password}</p>
              <WrapIcon onClick={handleOpenPassword}>
                {openPassword ? (
                  <IconEyeOpen fill={theme[currentTheme].color.mainColor2} />
                ) : (
                  <IconEyeClosed fill={theme[currentTheme].color.mainColor2} />
                )}
              </WrapIcon>
            </Label>
            <TextCondition>
              Натискаючи Зареєструватися, Ви приймаєте
              <StyledNavLinkCondition to="./">
                Політику конфіденційності
              </StyledNavLinkCondition>
              .
            </TextCondition>
            <Button type="submit">Зареєструватися</Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FormRegistrationEmail;
