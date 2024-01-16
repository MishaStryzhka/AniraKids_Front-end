import { useDispatch } from 'react-redux';
import { register } from '../../../redux/auth';
import { Formik } from 'formik';
import { validRegistrationEmailScheme } from 'schemas';
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
import { useTranslation } from 'react-i18next';

const FormRegistrationEmail = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

  const handleOpenPassword = () => {
    setOpenPassword(openPassword => !openPassword);
  };

  const handleRegistrationEmailSubmit = values => {
    const { email, password } = values;

    console.log(values);

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
              {t('email')}
              <FieldStyled
                // type="email"
                name="email"
                onChange={e => handleChange(e)}
                value={values.email}
                placeholder="***@gmail"
                required
              />
              <p>{errors.email && touched.email && errors.email}</p>
            </Label>
            <Label>
              {t('password')}
              <FieldStyled
                placeholder="****"
                type={openPassword ? 'text' : 'password'}
                name="password"
                onChange={e => handleChange(e)}
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
              {t('privacyPolicyText')}
              <StyledNavLinkCondition to="./">
                {t('privacyPolicyLinkText')}
              </StyledNavLinkCondition>
              .
            </TextCondition>
            <Button type="submit">{t('registration')}</Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FormRegistrationEmail;
