import Button from 'components/Button/Button';
import {
  BoxButtonsNavigation,
  ButtonContact,
  ButtonNav,
  Description,
  DescriptionLink,
  FieldStyled,
  Form,
  Label,
  ModalWindow,
  Separation,
  StyledNavLink,
  StyledNavLinkCondition,
  TextCondition,
  TitleLogin,
  Wrap,
  WrapButton,
  WrapForm,
  WrapIcon,
  WrapLinks,
} from './ModalRegistration.styled';
import IconFacebook from 'images/icons/IconFacebook';
import IconGoogle from 'images/icons/IconGoogle';
import IconEmail from 'images/icons/IcomEmail';
import { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import IconArrow from 'images/icons/IconArrow';
import { useDispatch } from 'react-redux';
import { register } from '../../../redux/auth';
import { logIn } from '../../../redux/auth/operations';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Field is required')
    .email('Enter a valid Email'),
  primaryPhoneNumber: Yup.string().when('isPhone', {
    is: true,
    then: Yup.string().required('Field is required'),
  }),
  password: Yup.string()
    .required('Field is required')
    .min(6, 'Password must be at least 6 characters')
    .max(16, 'Password must be less than 16 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,16}$/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
    ),
});

const ModalRegistration = () => {
  const [typeNavigation, setTypeNavigation] = useState('registration');
  const [isContact, setIsContact] = useState('email');
  const [openPassword, setOpenPassword] = useState(false);
  const dispatch = useDispatch();

  const handleOpenPassword = () =>
    setOpenPassword(openPassword => !openPassword);

  const [isActiveBtn, setIsActiveBtn] = useState({
    button1: true,
    button2: false,
  });
  const [isActiveBtnNav, setIsActiveBtnNav] = useState({
    button1: true,
    button2: false,
  });

  const handleButtonClick = (button1, button2) => {
    setIsActiveBtn(prevStates => ({
      ...prevStates,
      [button1]: !prevStates[button1],
      [button2]: !prevStates[button2],
    }));
  };

  const handleButtonNavClick = (button1, button2) => {
    setIsActiveBtnNav(prevStates => ({
      ...prevStates,
      [button1]: !prevStates[button1],
      [button2]: !prevStates[button2],
    }));
  };

  const handleLogInSubmit = values => {
    const { email, password, login, primaryPhoneNumber } = values;
    console.log('typeNavigation', typeNavigation);

    typeNavigation === 'registration' &&
      dispatch(
        register(
          isContact === 'email'
            ? { email, password }
            : { primaryPhoneNumber, password }
        )
      );
    typeNavigation === 'authorization' && dispatch(logIn({ login, password }));

    console.log('Form values:', values);
  };

  return (
    <ModalWindow>
      <WrapForm>
        <Formik
          initialValues={{
            email: '',
            primaryPhoneNumber: '',
            password: '',
            login: '',
          }}
          validationSchema={validationSchema}
          validateOnChange={false}
          onSubmit={handleLogInSubmit}
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
              <BoxButtonsNavigation>
                <ButtonNav
                  $isActive={isActiveBtnNav.button1}
                  type="button"
                  onClick={() => {
                    setTypeNavigation('registration');
                    handleButtonNavClick('button1', 'button2');
                  }}
                >
                  Реєстрація
                </ButtonNav>
                <ButtonNav
                  $isActive={isActiveBtnNav.button2}
                  type="button"
                  onClick={() => {
                    setTypeNavigation('authorization');
                    handleButtonNavClick('button2', 'button1');
                  }}
                >
                  Авторизація
                </ButtonNav>
              </BoxButtonsNavigation>
              {typeNavigation === 'registration' && (
                <>
                  <Description>
                    Зареєструйтеся за допомогою номера телефону або електронної
                    пошти
                  </Description>
                  <WrapButton>
                    <ButtonContact
                      $isActive={isActiveBtn.button1}
                      type="button"
                      onClick={() => {
                        setIsContact('email');
                        handleButtonClick('button1', 'button2');
                      }}
                    >
                      Email
                    </ButtonContact>
                    <ButtonContact
                      $isActive={isActiveBtn.button2}
                      type="button"
                      onClick={() => {
                        setIsContact('primaryPhoneNumber');
                        handleButtonClick('button2', 'button1');
                      }}
                    >
                      Номер телефону
                    </ButtonContact>
                  </WrapButton>
                  <Wrap>
                    {isContact === 'primaryPhoneNumber' && (
                      <Label>
                        Номер телефону
                        <FieldStyled
                          placeholder="+380"
                          type="tel"
                          name="primaryPhoneNumber"
                          onChange={handleChange}
                          value={values.primaryPhoneNumber}
                          required
                        />
                        <p>
                          {errors.primaryPhoneNumber &&
                            touched.primaryPhoneNumber &&
                            errors.primaryPhoneNumber}
                        </p>
                      </Label>
                    )}
                    {isContact === 'email' && (
                      <Label>
                        Email
                        <FieldStyled
                          type="email"
                          name="email"
                          onChange={handleChange}
                          value={values.email}
                          placeholder="***@gmail"
                          required
                        />
                        <p>{errors.email && touched.email && errors.email}</p>
                      </Label>
                    )}
                    <Label>
                      Пароль
                      <FieldStyled
                        placeholder="****"
                        type={openPassword ? 'text' : 'password'}
                        name="password"
                        onChange={handleChange}
                        value={values.password}
                        required
                      />
                      <p>
                        {errors.password && touched.password && errors.password}
                      </p>
                      <WrapIcon>
                        <IconArrow onClick={handleOpenPassword} />
                      </WrapIcon>
                    </Label>
                  </Wrap>
                  <TextCondition>
                    Натискаючи Продовжити, Ви приймаєте
                    <StyledNavLinkCondition to="./">
                      Політику конфіденційності
                    </StyledNavLinkCondition>
                    .
                  </TextCondition>
                  <Button type="submit" onSubmit={handleSubmit}>
                    Зареєструватися
                  </Button>
                </>
              )}
              {typeNavigation === 'authorization' && (
                <>
                  <Description>
                    Авторизуйтеся за допомогою логіну (введіть номер телефону
                    або електорнну пошту)
                  </Description>
                  <TitleLogin>Login</TitleLogin>
                  <Wrap>
                    <Label>
                      Логін
                      <FieldStyled
                        placeholder="Email / Номер телефону"
                        onChange={handleChange}
                        name="login"
                        value={values.login}
                        required
                      />
                    </Label>

                    <Label>
                      Пароль
                      <FieldStyled
                        type={openPassword ? 'text' : 'password'}
                        name="password"
                        onChange={handleChange}
                        value={values.password}
                        placeholder="****"
                        required
                      />
                    </Label>
                  </Wrap>
                  <Button type="submit" onSubmit={handleSubmit}>
                    Увійти
                  </Button>
                </>
              )}
              <Separation>АБО</Separation>
              <WrapLinks>
                <StyledNavLink>
                  <IconFacebook />
                  <DescriptionLink>Facebook</DescriptionLink>
                </StyledNavLink>
                <StyledNavLink>
                  <IconGoogle />
                  <DescriptionLink>Google</DescriptionLink>
                </StyledNavLink>
                <StyledNavLink>
                  <IconEmail />
                  <DescriptionLink>Інше</DescriptionLink>
                </StyledNavLink>
              </WrapLinks>
            </Form>
          )}
        </Formik>
      </WrapForm>
    </ModalWindow>
  );
};

export default ModalRegistration;
