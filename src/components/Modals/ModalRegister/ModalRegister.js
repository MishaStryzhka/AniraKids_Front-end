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
import { useTranslation } from 'react-i18next';

const ModalRegister = ({ handleCloseModal }) => {
  const [typeNavigation, setTypeNavigation] = useState('registration');
  const [typeRegistration, setTypeRegistration] = useState('email');
  const { t } = useTranslation();

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
            {t('Registration')}
          </ButtonNav>
          <ButtonNav
            $isActive={isActiveBtnNav.button2}
            type="button"
            onClick={() => {
              setTypeNavigation('authorization');
              handleButtonNavClick('button2', 'button1');
            }}
          >
            {t('Authorization')}
          </ButtonNav>
        </BoxButtonsNavigation>
        {typeNavigation === 'registration' && (
          <>
            <Description>
              {t('Register with phone number or email')}
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
                {t('Email')}
              </ButtonContact>
              <ButtonContact
                $isActive={isActiveBtn.button2}
                type="button"
                onClick={() => {
                  setTypeRegistration('primaryPhoneNumber');
                  handleButtonClick('button2', 'button1');
                }}
              >
                {t('Phone Number')}
              </ButtonContact>
            </WrapButton>
            <Wrap>
              {typeRegistration === 'email' && (
                <FormRegistrationEmail
                  handleCloseModal={() => handleCloseModal()}
                />
              )}
              {typeRegistration === 'primaryPhoneNumber' && (
                <FormRegistrationPhoneNumber />
              )}
            </Wrap>
          </>
        )}
        {typeNavigation === 'authorization' && <AuthForm />}
        <Separation>{t('Or')}</Separation>
        <WrapLinks>
          <StyledNavLink>
            <IconFacebook />
            <DescriptionLink>{t('Facebook')}</DescriptionLink>
          </StyledNavLink>
          <StyledNavLink>
            <IconGoogle />
            <DescriptionLink>{t('Google')}</DescriptionLink>
          </StyledNavLink>
          <StyledNavLink>
            <IconEmail />
            <DescriptionLink>{t('Other')}</DescriptionLink>
          </StyledNavLink>
        </WrapLinks>
      </WrapForm>
    </ModalWindow>
  );
};
export default ModalRegister;
