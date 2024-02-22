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
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

const ModalRegister = ({ handleCloseModal }) => {
  const [typeNavigation, setTypeNavigation] = useState('registration');
  const [typeRegistration, setTypeRegistration] = useState('email');
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalRegister',
  });

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

  const login = useGoogleLogin({
    onSuccess: credentialResponse => {
      console.log('credentialResponse', credentialResponse);
    },
  });

  console.log(
    'process.env.REACT_APP_GOOGLE_CLIENT_DI',
    process.env.REACT_APP_GOOGLE_CLIENT_DI
  );

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
        {typeNavigation === 'authorization' && (
          <AuthForm handleCloseModal={() => handleCloseModal()} />
        )}
        <Separation>{t('Or')}</Separation>
        <WrapLinks>
          <StyledNavLink>
            <IconFacebook />
            <DescriptionLink>{t('Facebook')}</DescriptionLink>
          </StyledNavLink>
          <GoogleLogin
            onSuccess={credentialResponse => {
              console.log(credentialResponse);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
          ;
          <StyledNavLink
            // href={`${process.env.REACT_APP_BACKEND_BASE_URL}/api/users/google/`}
            onClick={() => login()}
          >
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
