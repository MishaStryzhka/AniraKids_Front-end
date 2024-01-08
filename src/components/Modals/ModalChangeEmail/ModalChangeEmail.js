import Button from 'components/Button/Button';
import {
  Form,
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangeEmail.styled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserEmail } from '../../../redux/auth/operations';
import { validUpdateEmailScheme } from 'schemas';
import { useAuth } from 'hooks';
import { BeatLoader } from 'react-spinners';
import { TextDone } from '../Modal.styled';
import { clearDone, clearError } from '../../../redux/auth/slice';
import { TextError } from 'components/Forms/Form.styled';
import { useEffect } from 'react';
import { WrapButton } from '../ModalRegister/ModalRegister.styled';

const ModalChangeEmail = ({ onClick }) => {
  const { isLoading, error, isDone } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    isDone &&
      setTimeout(() => {
        dispatch(clearDone());
        document.body.style.overflow = 'auto';
        onClick();
      }, 2500);
  }, [dispatch, isDone, onClick]);

  const handleSubmitEmail = async ({ email }) => {
    dispatch(clearError());
    await dispatch(updateUserEmail({ email }));
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
          email: '',
        }}
        validationSchema={validUpdateEmailScheme}
        onSubmit={handleSubmitEmail}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => {
          return isDone ? (
            <TextDone>Вітаємо, ваш емайл змінено "{values.email}"!</TextDone>
          ) : (
            <Form onSubmit={handleSubmit}>
              <ModalTitle>Змінити пошту</ModalTitle>
              <LabelModal>
                Введіть адресу електронної пошти
                <InputModal
                  value={values.email}
                  type="email"
                  name="email"
                  onChange={e => {
                    // console.log(e.target.value);
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="exsample@gmail.com"
                />
                <TextError>
                  {(errors.email && touched.email && errors.email) ||
                    (error?.message === 'Email in use' &&
                      'Упс, ця пошта вже зайнята!')}
                </TextError>
              </LabelModal>
              <WrapButton>
                <Button type="submit">
                  {!isLoading ? 'Зберегти' : <BeatLoader color="#fff" />}
                </Button>
              </WrapButton>
            </Form>
          );
        }}
      </Formik>
    </ModalWindow>
  );
};

export default ModalChangeEmail;
