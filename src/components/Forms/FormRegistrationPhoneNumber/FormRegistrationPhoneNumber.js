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
import { useAuth, useStorage } from 'hooks';
import { validRegistrationPhoneNumberScheme } from 'schemas';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../Form.styled';
import { BeatLoader } from 'react-spinners';

const FormRegistrationPhoneNumber = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formRegistrationPhoneNumber',
  });
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme, error, isLoading } = useAuth();
  const storage = useStorage();

  const handleOpenPassword = () =>
    setOpenPassword(openPassword => !openPassword);

  const handleRegistrationSubmit = values => {
    const { primaryPhoneNumber, password } = values;

    dispatch(
      register({
        primaryPhoneNumber,
        password,
        favorites: storage.get('favorites') || [],
      })
    );
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
                <ErrorMessage>
                  {(errors.primaryPhoneNumber &&
                    touched.primaryPhoneNumber &&
                    t(errors.primaryPhoneNumber)) ||
                    (error?.message === 'Phone number in use' &&
                      t(error?.message))}
                </ErrorMessage>
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
                <ErrorMessage>
                  {errors.password && touched.password && t(errors.password)}
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
              <TextCondition>
                {t('privacyPolicyText')}
                <StyledNavLinkCondition to="./">
                  {t('privacyPolicyLinkText')}
                </StyledNavLinkCondition>
                .
              </TextCondition>
              <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                {!isLoading ? t('registerButton') : <BeatLoader color="#fff" />}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default FormRegistrationPhoneNumber;
