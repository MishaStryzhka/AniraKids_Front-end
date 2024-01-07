import { useState } from 'react';
import {
  BoxButtonsNavigation,
  ButtonContact,
  ButtonNav,
  Description,
  DescriptionLink,
  ModalWindow,
  Separation,
  StyledNavLink,
  Wrap,
  WrapButton,
  WrapForm,
  WrapLinks,
} from './ModalRegister.styled';
import FormRegistrationPhoneNumber from 'components/Forms/FormRegistrationPhoneNumber/FormRegistrationPhoneNumber';
import FormRegistrationEmail from '../../Forms/FormRegistrationEmail/FormRegistrationEmail';
import AuthForm from 'components/Forms/AuthForm/AuthForm';
import IconFacebook from 'images/icons/IconFacebook';
import IconGoogle from 'images/icons/IconGoogle';
import IconEmail from 'images/icons/IcomEmail';

const ModalRegister = () => {
  const [typeNavigation, setTypeNavigation] = useState('registration');
  const [typeRegistration, setTypeRegistration] = useState('email');

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
  return (
    <ModalWindow>
      <WrapForm>
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
              Зареєструйтеся за допомогою номера телефону або електронної пошти
            </Description>
            <WrapButton>
              <ButtonContact
                $isActive={isActiveBtn.button1}
                type="button"
                onClick={() => {
                  setTypeRegistration('email');
                  handleButtonClick('button1', 'button2');
                }}
              >
                Email
              </ButtonContact>
              <ButtonContact
                $isActive={isActiveBtn.button2}
                type="button"
                onClick={() => {
                  setTypeRegistration('primaryPhoneNumber');
                  handleButtonClick('button2', 'button1');
                }}
              >
                Номер телефону
              </ButtonContact>
            </WrapButton>
            <Wrap>
              {typeRegistration === 'email' && <FormRegistrationEmail />}
              {typeRegistration === 'primaryPhoneNumber' && (
                <FormRegistrationPhoneNumber />
              )}
            </Wrap>
          </>
        )}
        {typeNavigation === 'authorization' && <AuthForm />}
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
      </WrapForm>
    </ModalWindow>
  );
};
export default ModalRegister;
