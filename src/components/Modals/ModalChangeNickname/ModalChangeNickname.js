import { Formik } from 'formik';
import { Form, Label } from './ModalChangeNickname.styled';
import Button from 'components/Button/Button';
import {
  ErrorMessage,
  GeneralModalWindow,
  InputModal,
  ModalTitle,
} from '../Modal.styled';

const { useTranslation } = require('react-i18next');

const ModalChangeNickname = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangeNickname',
  });
  const handleNicknameSubmit = values => {
    const { Nickname } = values;

    console.log(values);
    console.log(Nickname);
    //  dispatch(updateUserInfo({ primaryPhoneNumber }));
  };
  return (
    <GeneralModalWindow>
      <Formik
        initialValues={{
          primaryPhoneNumber: '',
        }}
        // validationSchema={validPhoneNumberScheme}
        onSubmit={handleNicknameSubmit}
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
            <ModalTitle>{t('changeNickname')}</ModalTitle>
            <Label>
              {t('Nickname')}
              <InputModal
                type="text"
                name="Nickname"
                onChange={e => handleChange(e)}
                value={values.Nickname}
                required
                placeholder="@nastia25"
              />
              <ErrorMessage>
                {errors.Nickname && touched.Nickname && errors.Nickname}
              </ErrorMessage>
            </Label>
            <Button type="submit">{t('saveButton')}</Button>
          </Form>
        )}
      </Formik>
    </GeneralModalWindow>
  );
};

export default ModalChangeNickname;
