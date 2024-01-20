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
import { useEffect } from 'react';
import { WrapButton } from '../ModalRegister/ModalRegister.styled';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from 'components/Forms/Form.styled';

const ModalChangeEmail = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangeEmail',
  });
  const { isLoading, error, isDone } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    isDone &&
      setTimeout(() => {
        dispatch(clearDone());
        document.body.style.overflow = 'auto';
        onClick();
      }, 5000);
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
            <TextDone>
              {t('changeEmailMessage', { email: values.email })}
            </TextDone>
          ) : (
            <Form onSubmit={handleSubmit}>
              <ModalTitle>{t('changeEmailTitle')}</ModalTitle>
              <LabelModal>
                {t('enterEmailLabel')}
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
                <ErrorMessage>
                  {(errors.email && touched.email && errors.email) ||
                    (error?.message === 'Email in use' && t('Email in use'))}
                </ErrorMessage>
              </LabelModal>
              <WrapButton>
                <Button type="submit">
                  {!isLoading ? t('saveButton') : <BeatLoader color="#fff" />}
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
