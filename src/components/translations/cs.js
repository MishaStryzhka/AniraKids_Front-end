import { AppBarTranslationsCs } from 'components/AppBar/translations/cs';
import { BoxNavLinksTranslationsCs } from 'components/BoxNavLinks/translations/cs';
import { AuthFormTranslationsCs } from 'components/Forms/AuthForm/translations/cs';
import { SectionHeroTranslationsCs } from 'components/SectionHero/translations/cs';
import { SectionAboutAniraKTranslationsCs } from 'components/SectionAboutAniraK/translations/cs';
import { SectionAboutUsTranslationsCs } from 'components/SectionAboutUs/translations/cs';
import { SectionOurMissionTranslationsCs } from 'components/SectionOurMission/translations/cs';
import { SectionSimpleStepsTranslationsCs } from 'components/SectionSimpleSteps/translations/cs';
import { SectionAreYouReadyTranslationsCs } from 'components/SectionAreYouReady/translations/cs';
import { FormRegistrationEmailTranslationsCs } from 'components/Forms/FormRegistrationEmail/translations/cs';
import { FormRegistrationPhoneNumberTranslationsCs } from 'components/Forms/FormRegistrationPhoneNumber/translations/cs';
import { ModalChangeEmailTranslationsCs } from 'components/Modals/ModalChangeEmail/translations/cs';
import { ModalRegisterTranslationsCs } from 'components/Modals/ModalRegister/translations/cs';
import { NavigationOverlayTranslationsCs } from 'components/NavigationOverlay/translations/cs';
import { SearchInputTranslationsCs } from 'components/SearchInput/translations/cs';

export const ComponentTranslationsCs = {
  appBar: AppBarTranslationsCs,
  sectionHero: SectionHeroTranslationsCs,
  sectionAboutAniraK: SectionAboutAniraKTranslationsCs,
  sectionAboutUs: SectionAboutUsTranslationsCs,
  sectionOurMission: SectionOurMissionTranslationsCs,
  sectionSimpleSteps: SectionSimpleStepsTranslationsCs,
  sectionAreYouReady: SectionAreYouReadyTranslationsCs,
  boxNavLinks: BoxNavLinksTranslationsCs,
  ...SearchInputTranslationsCs,
  ...NavigationOverlayTranslationsCs,

  ...ModalRegisterTranslationsCs,
  formRegistrationEmail: FormRegistrationEmailTranslationsCs,
  formRegistrationPhoneNumber: FormRegistrationPhoneNumberTranslationsCs,
  authForm: AuthFormTranslationsCs,
  modalChangeEmail: ModalChangeEmailTranslationsCs,
};
