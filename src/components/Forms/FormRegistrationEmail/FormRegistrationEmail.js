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
import { useAuth, useStorage } from 'hooks';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../Form.styled';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

const FormRegistrationEmail = ({ handleCloseModal }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formRegistrationEmail',
  });
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme, error, isLoading } = useAuth();
  const storage = useStorage();
  const navigate = useNavigate();

  const handleOpenPassword = () => {
    setOpenPassword(openPassword => !openPassword);
  };

  const handleRegistrationEmailSubmit = values => {
    const { email, password } = values;
    dispatch(
      register({ email, password, favorites: storage.get('favorites') || [] })
    );
    navigate('/my-account/profile', { replace: true });
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
                type="email"
                name="email"
                onChange={e => handleChange(e)}
                value={values.email}
                placeholder="***@gmail"
                required
              />
              <ErrorMessage>
                {(errors?.email && touched?.email && t(errors?.email)) ||
                  (error?.message === 'Email in use' && t(error?.message))}
              </ErrorMessage>
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
              <ErrorMessage>
                {errors.password && touched.password && t(errors.password)}
              </ErrorMessage>
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
              <StyledNavLinkCondition
                to="/privacy-policy"
                onClick={() => handleCloseModal()}
              >
                {t('privacyPolicyLinkText')}
              </StyledNavLinkCondition>
              .
            </TextCondition>
            <Button type="submit" disabled={isLoading}>
              {!isLoading ? t('registration') : <BeatLoader color="#fff" />}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FormRegistrationEmail;
