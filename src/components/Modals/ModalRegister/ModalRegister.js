import { useState } from 'react';
import {
  BoxButtonsNavigation,
  ButtonContact,
  ButtonNav,
  Description,
  ModalWindow,
  Separation,
  StyledNavLink,
  StyledSeznamWrap,
  Wrap,
  WrapButton,
  WrapForm,
  WrapLinks,
} from './ModalRegister.styled';
import FormRegistrationPhoneNumber from 'components/Forms/FormRegistrationPhoneNumber/FormRegistrationPhoneNumber';
import FormRegistrationEmail from '../../Forms/FormRegistrationEmail/FormRegistrationEmail';
import AuthForm from 'components/Forms/AuthForm/AuthForm';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { authByGoogle } from '../../../redux/auth/operations';
import { useDispatch } from 'react-redux';
import IconSeznamLogoEskoCervena from 'images/icons/IconSeznamLogoEskoCervena';
import { nanoid } from '@reduxjs/toolkit';
import { useStorage } from 'hooks';

const ModalRegister = ({ handleCloseModal }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalRegister',
  });
  const [typeRegistration, setTypeRegistration] = useState('email');
  const [typeNavigation, setTypeNavigation] = useState('registration');
  const storage = useStorage();
  const dispatch = useDispatch();

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

  const requestSecretSeznam = nanoid();
  storage.set('requestSecretSeznam', requestSecretSeznam);
  const { origin } = new URL(window.location.href);

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
          {/* <StyledNavLink>
            <IconFacebook />
            <DescriptionLink>{t('Facebook')}</DescriptionLink>
          </StyledNavLink> */}
          <StyledNavLink
            href={`https://login.szn.cz/api/v1/oauth/auth
	?client_id=${process.env.REACT_APP_SEZNAM_CLIENT_ID}
	&scope=identity
	&response_type=code
	&redirect_uri=${origin}
	&state=${requestSecretSeznam}`}
          >
            <StyledSeznamWrap>
              <IconSeznamLogoEskoCervena />
            </StyledSeznamWrap>
          </StyledNavLink>
          <GoogleLogin
            type="icon"
            theme="outline"
            onSuccess={credentialResponse => {
              console.log(credentialResponse);
              dispatch(authByGoogle(credentialResponse));
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
          {/* <StyledNavLink>
            <IconEmail />
            <DescriptionLink>{t('Other')}</DescriptionLink>
          </StyledNavLink> */}
        </WrapLinks>
      </WrapForm>
    </ModalWindow>
  );
};
export default ModalRegister;
