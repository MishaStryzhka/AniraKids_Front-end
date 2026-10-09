import Button from 'components/Button/Button';
import { Form, LabelModal } from './ModalChangeEmail.styled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserEmail } from '../../../redux/auth/operations';
import { validUpdateEmailScheme } from 'schemas';
import { BeatLoader } from 'react-spinners';
import {
  GeneralModalWindow,
  InputModal,
  ModalTitle,
  TextDone,
} from '../Modal.styled';
import { useEffect, useState } from 'react';
import { WrapButton } from '../ModalRegister/ModalRegister.styled';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from 'components/Forms/Form.styled';

const ModalChangeEmail = ({ closeModal }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangeEmail',
  });
  const [error, setError] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isDone) return;
    const timer = setTimeout(closeModal, 5000);
    return () => clearTimeout(timer);
  }, [isDone, closeModal]);

  const handleSubmitEmail = async ({ email }) => {
    setError(null);
    try {
      await dispatch(updateUserEmail({ email })).unwrap();
      setIsDone(true);
    } catch (failure) {
      setError(failure);
    }
  };

  return (
    <GeneralModalWindow>
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
          isSubmitting,
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
                    setError(null);
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="novy@email.cz"
                />
                <ErrorMessage>
                  {(errors.email && touched.email && errors.email) ||
                    (error && (error.message === 'Email in use' ? t('Email in use') : 'Změnu e-mailu se nepodařilo odeslat. Zkuste to znovu.'))}
                </ErrorMessage>
              </LabelModal>
              <WrapButton>
                <Button type="submit" disabled={isSubmitting}>
                  {!isSubmitting ? t('saveButton') : <BeatLoader color="#fff" />}
                </Button>
              </WrapButton>
            </Form>
          );
        }}
      </Formik>
    </GeneralModalWindow>
  );
};

export default ModalChangeEmail;
