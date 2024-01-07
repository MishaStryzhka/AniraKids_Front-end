import Button from 'components/Button/Button';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
  WrapButton,
} from './ModalChangeLogin.styled';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../../../redux/auth/operations';
import { validUpdateLoginScheme } from 'schemas';

const ModalChangeLogin = ({ onClick }) => {
  const dispatch = useDispatch();

  const handleSubmitLogin = values => {
    const { login } = values;

    console.log(values);
    dispatch(updateUserInfo({ login }));
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
          login: '',
        }}
        validationSchema={validUpdateLoginScheme}
        onSubmit={handleSubmitLogin}
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
            <ModalTitle>Змінити логін</ModalTitle>
            <LabelModal>
              Логін
              <InputModal
                value={values.login}
                name="login"
                onChange={e => {
                  console.log(e.target.value);
                  handleChange(e);
                }}
                placeholder="@nastia25"
              />
              <p>{errors.login && touched.login && errors.login}</p>
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

export default ModalChangeLogin;
