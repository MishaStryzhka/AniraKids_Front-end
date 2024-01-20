import { BoxNavLinksTranslationsUk } from 'components/BoxNavLinks/translations/uk';
import { AuthFormTranslationsUk } from 'components/Forms/AuthForm/translations/uk';
import { FormRegistrationEmailTranslationsUk } from 'components/Forms/FormRegistrationEmail/translations/uk';
import { FormRegistrationPhoneNumberTranslationsUk } from 'components/Forms/FormRegistrationPhoneNumber/translations/uk';
import { ModalChangeEmailTranslationsUk } from 'components/Modals/ModalChangeEmail/translations/uk';
import { ModalRegisterTranslationsUk } from 'components/Modals/ModalRegister/translations/uk';
import { NavigationOverlayTranslationsUk } from 'components/NavigationOverlay/translations/uk';
import { SearchInputTranslationsUk } from 'components/SearchInput/translations/uk';
import { UserPageTranslationsUk } from 'pages/UserPage/translations/uk';

export const ComponentTranslationsUk = {
  boxNavLinks: BoxNavLinksTranslationsUk,
  ...SearchInputTranslationsUk,
  ...NavigationOverlayTranslationsUk,
  ...UserPageTranslationsUk,
  ...ModalRegisterTranslationsUk,
  formRegistrationEmail: FormRegistrationEmailTranslationsUk,
  formRegistrationPhoneNumber: FormRegistrationPhoneNumberTranslationsUk,
  authForm: AuthFormTranslationsUk,
  modalChangeEmail: ModalChangeEmailTranslationsUk,
};
