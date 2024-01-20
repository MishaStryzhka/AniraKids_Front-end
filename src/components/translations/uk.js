import { AppBarTranslationsUk } from 'components/AppBar/translations/uk';
import { SectionHeroTranslationsUk } from 'components/SectionHero/translations/uk';
import { SectionAboutAniraKTranslationsUk } from 'components/SectionAboutAniraK/translations/uk';
import { SectionAboutUsTranslationsUk } from 'components/SectionAboutUs/translations/uk';
import { SectionOurMissionTranslationsUk } from 'components/SectionOurMission/translations/uk';
import { SectionSimpleStepsTranslationsUk } from 'components/SectionSimpleSteps/translations/uk';
import { SectionAreYouReadyTranslationsUk } from 'components/SectionAreYouReady/translations/uk';
import { AuthFormTranslationsUk } from 'components/Forms/AuthForm/translations/uk';
import { FormRegistrationEmailTranslationsUk } from 'components/Forms/FormRegistrationEmail/translations/uk';
import { FormRegistrationPhoneNumberTranslationsUk } from 'components/Forms/FormRegistrationPhoneNumber/translations/uk';
import { ModalChangeEmailTranslationsUk } from 'components/Modals/ModalChangeEmail/translations/uk';
import { ModalRegisterTranslationsUk } from 'components/Modals/ModalRegister/translations/uk';
import { NavigationOverlayTranslationsUk } from 'components/NavigationOverlay/translations/uk';
import { SearchInputTranslationsUk } from 'components/SearchInput/translations/uk';
import { UserPageTranslationsUk } from 'pages/UserPage/translations/uk';

export const ComponentTranslationsUk = {
  appBar: AppBarTranslationsUk,
  sectionHero: SectionHeroTranslationsUk,
  sectionAboutAniraK: SectionAboutAniraKTranslationsUk,
  sectionAboutUs: SectionAboutUsTranslationsUk,
  sectionOurMission: SectionOurMissionTranslationsUk,
  sectionSimpleSteps: SectionSimpleStepsTranslationsUk,
  sectionAreYouReady: SectionAreYouReadyTranslationsUk,
  ...SearchInputTranslationsUk,
  ...NavigationOverlayTranslationsUk,
  ...UserPageTranslationsUk,
  ...ModalRegisterTranslationsUk,
  ...FormRegistrationEmailTranslationsUk,
  ...FormRegistrationPhoneNumberTranslationsUk,
  ...AuthFormTranslationsUk,
  modalChangeEmail: ModalChangeEmailTranslationsUk,
};
