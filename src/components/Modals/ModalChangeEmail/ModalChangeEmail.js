import Button from 'components/Button/Button';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
  WrapButton,
} from './ModalChangeEmail.styled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../../redux/auth/operations';
import { validUpdateEmailScheme } from 'schemas';

const ModalChangeEmail = ({ isCloseModal }) => {
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
          isCloseModal();
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
          <form onSubmit={handleSubmit}>
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
            <WrapButton>
              <Button type="submit">Зберегти</Button>
            </WrapButton>
          </form>
        )}
      </Formik>
    </ModalWindow>
  );
};

export default ModalChangeEmail;
