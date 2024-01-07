import { useDispatch } from 'react-redux';
import { register } from '../../../redux/auth';
import { Formik } from 'formik';
import { useState } from 'react';
import {
  Button,
  FieldStyled,
  Form,
  Label,
  StyledNavLinkCondition,
  TextCondition,
  WrapIcon,
} from './FormRegistrationPhoneNumber.styled';
import { validRegistrationPhoneNomberScheme } from 'components/ValidationSchemas/RegistrationSchemas';
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useAuth } from 'hooks';

const FormRegistrationPhoneNumber = () => {
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

  const handleOpenPassword = () =>
    setOpenPassword(openPassword => !openPassword);

  const handleRegistrationSubmit = values => {
    const { primaryPhoneNumber, password } = values;

    dispatch(register({ primaryPhoneNumber, password }));
  };
  return (
    <>
      <Formik
        initialValues={{
          primaryPhoneNumber: '',
          password: '',
        }}
        validationSchema={validRegistrationPhoneNomberScheme}
        validateOnChange={false}
        onSubmit={handleRegistrationSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <Form>
            <Label>
              Номер телефону
              <FieldStyled
                placeholder="+380"
                type="tel"
                name="primaryPhoneNumber"
                onChange={handleChange}
                value={values.primaryPhoneNumber}
                required
              />
              <p>
                {errors.primaryPhoneNumber &&
                  touched.primaryPhoneNumber &&
                  errors.primaryPhoneNumber}
              </p>
            </Label>
            <Label>
              Пароль
              <FieldStyled
                placeholder="****"
                type={openPassword ? 'text' : 'password'}
                name="password"
                onChange={handleChange}
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
            <Button type="submit" onSubmit={handleSubmit}>
              Зареєструватися
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FormRegistrationPhoneNumber;
