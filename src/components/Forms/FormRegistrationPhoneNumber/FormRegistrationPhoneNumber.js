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
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { validRegistrationPhoneNumberScheme } from 'schemas';
import { useTranslation } from 'react-i18next';

const FormRegistrationPhoneNumber = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

  const handleOpenPassword = () =>
    setOpenPassword(openPassword => !openPassword);

  const handleRegistrationSubmit = values => {
    const { primaryPhoneNumber, password } = values;

    console.log(values);
    dispatch(register({ primaryPhoneNumber, password }));
  };
  return (
    <>
      <Formik
        initialValues={{
          primaryPhoneNumber: '',
          password: '',
        }}
        validationSchema={validRegistrationPhoneNumberScheme}
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
        }) => {
          console.log('errors', errors);

          return (
            <Form id="myForm">
              <Label>
                {t('phoneNumberLabel')}
                <FieldStyled
                  placeholder={t('phoneNumberPlaceholder')}
                  type="tel"
                  name="primaryPhoneNumber"
                  onChange={e => handleChange(e)}
                  value={values.primaryPhoneNumber}
                  required
                />
                <p>
                  {errors.primaryPhoneNumber &&
                    touched.primaryPhoneNumber &&
                    t('phoneNumberErrorMessage')}
                </p>
              </Label>
              <Label>
                {t('passwordLabel')}
                <FieldStyled
                  placeholder={t('passwordPlaceholder')}
                  type={openPassword ? 'text' : 'password'}
                  name="password"
                  onChange={e => handleChange(e)}
                  value={values.password}
                  required
                />
                <p>
                  {errors.password &&
                    touched.password &&
                    t('passwordErrorMessage')}
                </p>
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
              <TextCondition>
                {t('privacyPolicyText')}
                <StyledNavLinkCondition to="./">
                  {t('privacyPolicyLinkText')}
                </StyledNavLinkCondition>
                .
              </TextCondition>
              <Button type="button" onClick={handleSubmit}>
                {t('registerButton')}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default FormRegistrationPhoneNumber;
