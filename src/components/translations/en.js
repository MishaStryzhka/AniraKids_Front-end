import { SectionHeroTranslationsEn } from 'components/SectionHero/translations/en';
import { SectionAboutAniraKTranslationsEn } from 'components/SectionAboutAniraK/translations/en';
import { SectionAboutUsTranslationsEn } from 'components/SectionAboutUs/translations/en';
import { SectionOurMissionTranslationsEn } from 'components/SectionOurMission/translations/en';
import { SectionSimpleStepsTranslationsEn } from 'components/SectionSimpleSteps/translations/en';
import { SectionAreYouReadyTranslationsEn } from 'components/SectionAreYouReady/translations/en';
import { BoxNavLinksTranslationsEn } from 'components/BoxNavLinks/translations/en';
import { AuthFormTranslationsEn } from 'components/Forms/AuthForm/translations/en';
import { FormRegistrationEmailTranslationsEn } from 'components/Forms/FormRegistrationEmail/translations/en';
import { FormRegistrationPhoneNumberTranslationsEn } from 'components/Forms/FormRegistrationPhoneNumber/translations/en';
import { ModalChangeEmailTranslationsEn } from 'components/Modals/ModalChangeEmail/translations/en';
import { ModalRegisterTranslationsEn } from 'components/Modals/ModalRegister/translations/en';
import { NavigationOverlayTranslationsEn } from 'components/NavigationOverlay/translations/en';
import { SearchInputTranslationsEn } from 'components/SearchInput/translations/en';
import { UserPageTranslationsEn } from 'pages/UserPage/translations/en';
import { AppBarTranslationsEn } from 'components/AppBar/translations/en';

export const ComponentTranslationsEn = {
  appBar: AppBarTranslationsEn,
  sectionHero: SectionHeroTranslationsEn,
  sectionAboutAniraK: SectionAboutAniraKTranslationsEn,
  sectionAboutUs: SectionAboutUsTranslationsEn,
  sectionOurMission: SectionOurMissionTranslationsEn,
  sectionSimpleSteps: SectionSimpleStepsTranslationsEn,
  sectionAreYouReady: SectionAreYouReadyTranslationsEn,
  boxNavLinks: BoxNavLinksTranslationsEn,
  ...SearchInputTranslationsEn,
  ...NavigationOverlayTranslationsEn,
  ...UserPageTranslationsEn,
  ...ModalRegisterTranslationsEn,
  formRegistrationEmail: FormRegistrationEmailTranslationsEn,
  formRegistrationPhoneNumber: FormRegistrationPhoneNumberTranslationsEn,
  ...AuthFormTranslationsEn,
  modalChangeEmail: ModalChangeEmailTranslationsEn,
};
