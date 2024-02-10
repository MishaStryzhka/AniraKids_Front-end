import Button from 'components/Button/Button';
import { Form, LabelModal, WrapIcon } from './ModalChangePassword.styled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../../redux/auth/operations';
import { useState } from 'react';
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { validPasswordScheme } from 'schemas';
import { useTranslation } from 'react-i18next';
import {
  GeneralModalWindow,
  InputModal,
  ModalTitle,
  StyledIconCross,
} from '../Modal.styled';

const ModalChangePassword = ({ onClick }) => {
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangePassword',
  });

  const handleOpenPassword = () => {
    setOpenPassword(openPassword => !openPassword);
  };

  const handlePasswordSubmit = values => {
    const { password, newPassword, confirmNewPassword } = values;

    console.log(values);
    console.log('password', password);
    dispatch(updateUserInfo({ newPassword, confirmNewPassword }));
  };
  return (
    <GeneralModalWindow>
      <Formik
        initialValues={{
          password: '',
          newPassword: '',
          confirmNewPassword: '',
        }}
        validationSchema={validPasswordScheme}
        onSubmit={handlePasswordSubmit}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <StyledIconCross
              onClick={() => {
                document.body.style.overflow = 'auto';
                onClick();
              }}
            />
            <ModalTitle>{t('changePassword')}</ModalTitle>
            <LabelModal>
              {t('yourPassword')}
              <InputModal
                type={openPassword ? 'text' : 'password'}
                name="password"
                onChange={handleChange}
                value={values.password}
                placeholder="****"
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
            </LabelModal>
            <LabelModal>
              {t('newPassword')}
              <InputModal
                type={openPassword ? 'text' : 'password'}
                name="newPassword"
                onChange={handleChange}
                value={values.newPassword}
                placeholder="****"
                required
              />
              <p>
                {errors.newPassword &&
                  touched.newPassword &&
                  errors.newPassword}
              </p>
              <WrapIcon onClick={handleOpenPassword}>
                {openPassword ? (
                  <IconEyeOpen fill={theme[currentTheme].color.mainColor2} />
                ) : (
                  <IconEyeClosed fill={theme[currentTheme].color.mainColor2} />
                )}
              </WrapIcon>
            </LabelModal>
            <LabelModal>
              {t('Enter new password')}
              <InputModal
                type={openPassword ? 'text' : 'password'}
                name="confirmNewPassword"
                onChange={handleChange}
                value={values?.confirmNewPassword}
                placeholder="****"
                required
              />
              <p>
                {errors.confirmNewPassword &&
                  touched.confirmNewPassword &&
                  errors.confirmNewPassword}
              </p>
              <WrapIcon onClick={handleOpenPassword}>
                {openPassword ? (
                  <IconEyeOpen fill={theme[currentTheme].color.mainColor2} />
                ) : (
                  <IconEyeClosed fill={theme[currentTheme].color.mainColor2} />
                )}
              </WrapIcon>
            </LabelModal>
            <Button type="submit">{t('saveButton')}</Button>
          </Form>
        )}
      </Formik>
    </GeneralModalWindow>
  );
};

export default ModalChangePassword;
