import { BoxNavigationTranslationsCs } from 'components/BoxNavLinks/translations/cs';
import { AuthFormTranslationsCs } from 'components/Forms/AuthForm/translations/cs';
import { FormRegistrationEmailTranslationsCs } from 'components/Forms/FormRegistrationEmail/translations/cs';
import { FormRegistrationPhoneNumberTranslationsCs } from 'components/Forms/FormRegistrationPhoneNumber/translations/cs';
import { ModalRegisterTranslationsCs } from 'components/Modals/ModalRegister/translations/cs';
import { NavigationOverlayTranslationsCs } from 'components/NavigationOverlay/translations/cs';
import { SearchInputTranslationsCs } from 'components/SearchInput/translations/cs';
import { UserPageTranslationsCs } from 'pages/UserPage/translations/cs';

export const ComponentTranslationsCs = {
  ...BoxNavigationTranslationsCs,
  ...SearchInputTranslationsCs,
  ...NavigationOverlayTranslationsCs,
  ...UserPageTranslationsCs,

  ...ModalRegisterTranslationsCs,
  ...FormRegistrationEmailTranslationsCs,
  ...FormRegistrationPhoneNumberTranslationsCs,
  ...AuthFormTranslationsCs,
};
