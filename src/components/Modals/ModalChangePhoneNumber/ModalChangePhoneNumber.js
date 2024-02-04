import Button from 'components/Button/Button';
import { Form, Label } from './ModalChangePhoneNumber.syled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../../redux/auth/operations';
import { validPhoneNumberScheme } from 'schemas';
import { useTranslation } from 'react-i18next';
import {
  GeneralModalWindow,
  InputModal,
  ModalTitle,
  StyledIconCross,
} from '../Modal.styled';

const ModalChangePhoneNumber = ({ onClick }) => {
  const dispatch = useDispatch();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangePhoneNumber',
  });

  const handlePhoneNumberSubmit = values => {
    const { primaryPhoneNumber } = values;

    console.log(values);
    dispatch(updateUserInfo({ primaryPhoneNumber }));
  };
  return (
    <GeneralModalWindow>
      <Formik
        initialValues={{
          primaryPhoneNumber: '',
        }}
        validationSchema={validPhoneNumberScheme}
        onSubmit={handlePhoneNumberSubmit}
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
            <StyledIconCross
              onClick={() => {
                document.body.style.overflow = 'auto';
                onClick();
              }}
            />
            <ModalTitle>{t('changePhoneNumber')}</ModalTitle>
            <Label>
              {t('phoneNumber')}
              <InputModal
                type="tel"
                name="primaryPhoneNumber"
                onChange={e => handleChange(e)}
                value={values.primaryPhoneNumber}
                required
                placeholder="+380"
              />
              <p>
                {errors.primaryPhoneNumber &&
                  touched.primaryPhoneNumber &&
                  errors.primaryPhoneNumber}
              </p>
            </Label>
            <Button type="submit">{t('saveButton')}</Button>
          </Form>
        )}
      </Formik>
    </GeneralModalWindow>
  );
};

export default ModalChangePhoneNumber;
