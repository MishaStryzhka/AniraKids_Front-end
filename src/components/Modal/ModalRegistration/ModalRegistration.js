import Button from 'components/Button/Button';
import {
  BoxButtonsNavigation,
  ButtonContact,
  ButtonNav,
  Description,
  DescriptionLink,
  Form,
  Input,
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
  WrapLinks,
} from './ModalRegistration.styled';
import IconFacebook from 'images/icons/IconFacebook';
import IconGoogle from 'images/icons/IconGoogle';
import IconEmail from 'images/icons/IcomEmail';
import { useState } from 'react';

const ModalRegistration = () => {
  const [typeNavigation, setTypeNavigation] = useState('registration');
  const [isContact, setIsContact] = useState('email');
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
        <Form>
          <BoxButtonsNavigation>
            <ButtonNav
              isActive={isActiveBtnNav.button1}
              type="button"
              onClick={() => {
                setTypeNavigation('registration');
                handleButtonNavClick('button1', 'button2');
              }}
            >
              Реєстрація
            </ButtonNav>
            <ButtonNav
              isActive={isActiveBtnNav.button2}
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
                  isActive={isActiveBtn.button1}
                  type="button"
                  onClick={() => {
                    setIsContact('email');
                    handleButtonClick('button1', 'button2');
                  }}
                >
                  Email
                </ButtonContact>
                <ButtonContact
                  isActive={isActiveBtn.button2}
                  type="button"
                  onClick={() => {
                    setIsContact('phone');
                    handleButtonClick('button2', 'button1');
                  }}
                >
                  Номер телефону
                </ButtonContact>
              </WrapButton>
              <Wrap>
                {isContact === 'phone' && (
                  <Label>
                    Номер телефону
                    <Input placeholder="+380" />
                  </Label>
                )}
                {isContact === 'email' && (
                  <Label>
                    Email
                    <Input placeholder="***@gmail" />
                  </Label>
                )}
                <Label>
                  Пароль
                  <Input placeholder="****" />
                </Label>
              </Wrap>
            </>
          )}
          {typeNavigation === 'authorization' && (
            <>
              <Description>
                Авторизуйтеся за допомогою логіну (введіть номер телефону або
                електорнну пошту)
              </Description>
              <TitleLogin>Login</TitleLogin>
              <Wrap>
                <Label>
                  Логін
                  <Input placeholder="Email / Номер телефону" />
                </Label>

                <Label>
                  Пароль
                  <Input placeholder="****" />
                </Label>
              </Wrap>
            </>
          )}
          <Button>ПРОДОВЖИТИ</Button>
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
          <TextCondition>
            Натискаючи Продовжити, Ви приймаєте
            <StyledNavLinkCondition>
              Політику конфіденційності
            </StyledNavLinkCondition>
            .
          </TextCondition>
        </Form>
      </WrapForm>
    </ModalWindow>
  );
};

export default ModalRegistration;
