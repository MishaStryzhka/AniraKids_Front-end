import { BoxNavLinksTranslationsEn } from 'components/BoxNavLinks/translations/en';
import { AuthFormTranslationsEn } from 'components/Forms/AuthForm/translations/en';
import { FormRegistrationEmailTranslationsEn } from 'components/Forms/FormRegistrationEmail/translations/en';
import { FormRegistrationPhoneNumberTranslationsEn } from 'components/Forms/FormRegistrationPhoneNumber/translations/en';
import { ModalChangeEmailTranslationsEn } from 'components/Modals/ModalChangeEmail/translations/en';
import { ModalRegisterTranslationsEn } from 'components/Modals/ModalRegister/translations/en';
import { NavigationOverlayTranslationsEn } from 'components/NavigationOverlay/translations/en';
import { SearchInputTranslationsEn } from 'components/SearchInput/translations/en';
import { UserPageTranslationsEn } from 'pages/UserPage/translations/en';

export const ComponentTranslationsEn = {
  boxNavLinks: BoxNavLinksTranslationsEn,
  ...SearchInputTranslationsEn,
  ...NavigationOverlayTranslationsEn,
  ...UserPageTranslationsEn,
  ...ModalRegisterTranslationsEn,
  formRegistrationEmail: FormRegistrationEmailTranslationsEn,
  formRegistrationPhoneNumber: FormRegistrationPhoneNumberTranslationsEn,
  authForm: AuthFormTranslationsEn,
  modalChangeEmail: ModalChangeEmailTranslationsEn,
};
