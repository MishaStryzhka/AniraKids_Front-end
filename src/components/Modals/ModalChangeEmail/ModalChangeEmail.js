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
import { updateUserInfo } from '../../../redux/auth/operations';
import { validUpdateEmailScheme } from 'schemas';

const ModalChangeEmail = ({ onClick }) => {
  const dispatch = useDispatch();

  const handleSubmitEmail = values => {
    const { email } = values;

    console.log(values);
    dispatch(updateUserInfo({ email }));
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
        }) => (
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
              <p>{errors.email && touched.email && errors.email}</p>
            </LabelModal>
            <Button type="submit">Зберегти</Button>
          </Form>
        )}
      </Formik>
    </ModalWindow>
  );
};

export default ModalChangeEmail;
