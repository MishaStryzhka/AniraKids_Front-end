import Button from 'components/Button/Button';
import {
  Form,
  Input,
  Label,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangePhoneNumber.syled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../../redux/auth/operations';
import { validPhoneNumberScheme } from 'schemas';

const ModalChangePhoneNumber = ({ onClick }) => {
  const dispatch = useDispatch();

  const handlePhoneNumberSubmit = values => {
    const { primaryPhoneNumber } = values;

    console.log(values);
    dispatch(updateUserInfo({ primaryPhoneNumber }));
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
            <ModalTitle>Змінити номер телефону</ModalTitle>
            <Label>
              Номер телефону
              <Input
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
            <Button type="submit">Зберегти</Button>
          </Form>
        )}
      </Formik>
    </ModalWindow>
  );
};

export default ModalChangePhoneNumber;
