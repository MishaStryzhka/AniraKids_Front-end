import Button from 'components/Button/Button';
import {
  Form,
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
  WrapIcon,
} from './ModalChangePassword.styled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../../redux/auth/operations';
import { useState } from 'react';
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { validPasswordScheme } from 'schemas';

const ModalChangePassword = ({ onClick }) => {
  const dispatch = useDispatch();
  const [openPassword, setOpenPassword] = useState(false);
  const { currentTheme } = useAuth();

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
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
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
            <ModalTitle>Змінити пароль</ModalTitle>
            <LabelModal>
              Ваш пароль
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
              Новий пароль
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
              Введіть новий пароль ще раз
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
            <Button type="submit">Зберегти</Button>
          </Form>
        )}
      </Formik>
    </ModalWindow>
  );
};

export default ModalChangePassword;
