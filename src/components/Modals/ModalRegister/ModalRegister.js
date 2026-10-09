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
import { hasSignedInOnDevice } from '../../../auth/deviceSignIn';
import { beginSeznamSignIn } from '../../../auth/seznamFlow';


const ModalRegister = ({ handleCloseModal, authNotice = '' }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalRegister',
  });
  const [typeRegistration, setTypeRegistration] = useState('email');
  const [typeNavigation, setTypeNavigation] = useState(() => (authNotice || hasSignedInOnDevice()) ? 'authorization' : 'registration');
  const [seznamError, setSeznamError] = useState('');
  const dispatch = useDispatch();

  return (
    <ModalWindow>
      <WrapForm>
        {authNotice && <p role="alert" style={{ margin: '0 0 16px', lineHeight: 1.5 }}>{authNotice}</p>}
        <BoxButtonsNavigation>
          <ButtonNav
            $isActive={typeNavigation === 'registration'}
            type="button"
            onClick={() => {
              setTypeNavigation('registration');
            }}
          >
            {t('Registration')}
          </ButtonNav>
          <ButtonNav
            $isActive={typeNavigation === 'authorization'}
            type="button"
            onClick={() => {
              setTypeNavigation('authorization');
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
                $isActive={typeRegistration === 'email'}
                type="button"
                onClick={() => {
                  setTypeRegistration('email');
                }}
              >
                {t('Email')}
              </ButtonContact>
              <ButtonContact
                $isActive={typeRegistration === 'primaryPhoneNumber'}
                type="button"
                onClick={() => {
                  setTypeRegistration('primaryPhoneNumber');
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
        {seznamError && <p role="alert">{seznamError}</p>}
        <WrapLinks>
          {/* <StyledNavLink>
            <IconFacebook />
            <DescriptionLink>{t('Facebook')}</DescriptionLink>
          </StyledNavLink> */}
          <StyledNavLink
            as="button"
            type="button"
            aria-label="Pokračovat přes Seznam"
            onClick={() => {
              try { window.location.assign(beginSeznamSignIn(process.env.REACT_APP_SEZNAM_CLIENT_ID)); }
              catch { setSeznamError('Přihlášení přes Seznam nyní není dostupné. Použijte prosím e-mail.'); }
            }}
          >
            <StyledSeznamWrap>
              <IconSeznamLogoEskoCervena />
            </StyledSeznamWrap>
          </StyledNavLink>
          <GoogleLogin
            type="icon"
            theme="outline"
            onSuccess={credentialResponse => {
              dispatch(authByGoogle(credentialResponse));
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
