import { useState } from 'react';
import {
  BoxButtonsNavigation,
  ButtonContact,
  ButtonNav,
  Description,
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
import IconEmail from 'images/icons/IcomEmail';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { authByGoogle } from '../../../redux/auth/operations';
import { useDispatch } from 'react-redux';
import IconSeznamLogoEskoCervena from 'images/icons/IconSeznamLogoEskoCervena';
import { nanoid } from '@reduxjs/toolkit';

const ModalRegister = ({ handleCloseModal }) => {
  const [typeNavigation, setTypeNavigation] = useState('registration');
  const [typeRegistration, setTypeRegistration] = useState('email');
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalRegister',
  });
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

  const qwe = nanoid();

  console.log('qwe', qwe);

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
          <StyledNavLink>
            <IconFacebook />
            {/* <DescriptionLink>{t('Facebook')}</DescriptionLink> */}
          </StyledNavLink>
          <StyledNavLink
            href={`https://login.szn.cz/api/v1/oauth/auth
	?client_id=f392b5e098cac39ddb00620731b57d1caf7b99b531542a4d
	&scope=identity
	&response_type=code
	&redirect_uri=${origin}
	&state=${qwe}`}
          >
            <IconSeznamLogoEskoCervena />
            {/* <DescriptionLink>{t('Facebook')}</DescriptionLink> */}
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
          <StyledNavLink>
            <IconEmail />
            {/* <DescriptionLink>{t('Other')}</DescriptionLink> */}
          </StyledNavLink>
        </WrapLinks>
      </WrapForm>
    </ModalWindow>
  );
};
export default ModalRegister;
