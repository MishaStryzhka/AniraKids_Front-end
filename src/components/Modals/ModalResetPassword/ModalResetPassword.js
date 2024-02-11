import { Formik } from 'formik';
import {
  ErrorMessage,
  GeneralModalWindow,
  InputModal,
  ModalTitle,
  StyledIconCross,
} from '../Modal.styled';
import Button from 'components/Button/Button';
import {
  Description,
  Form,
  LabelModal,
  Wrap,
} from './ModalResetPassword.styled';
import { useTranslation } from 'react-i18next';

const ModalResetPassword = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalResetPassword',
  });
  const handleSubmitEmail = values => {
    console.log(values);
  };
  return (
    <GeneralModalWindow>
      <Formik
        initialValues={{
          email: '',
        }}
        //  validationSchema={validUpdateEmailScheme}
        onSubmit={handleSubmitEmail}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          //           return
          //           isDone ? (
          //     <TextDone>
          //       {t('changeEmailMessage', { email: values.email })}
          //     </TextDone>
          //   ) :
          <Form onSubmit={handleSubmit}>
            <StyledIconCross
              onClick={() => {
                document.body.style.overflow = 'auto';
                onClick();
              }}
            />
            <Wrap>
              <ModalTitle>{t('resetPassword')}</ModalTitle>
              <Description>{t('enterYourEmail')}</Description>
            </Wrap>
            <LabelModal>
              {t('Email')}
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
                {errors.email && touched.email && errors.email}
              </ErrorMessage>
            </LabelModal>

            <Button type="submit">{t('saveButton')}</Button>
          </Form>
        )}
      </Formik>
    </GeneralModalWindow>
  );
};

export default ModalResetPassword;
