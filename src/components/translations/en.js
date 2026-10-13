import { SectionHeroTranslationsEn } from 'components/SectionHero/translations/en';
import { SectionAboutUsTranslationsEn } from 'components/SectionAboutUs/translations/en';
import { SectionOurMissionTranslationsEn } from 'components/SectionOurMission/translations/en';
import { AuthFormTranslationsEn } from 'components/Forms/AuthForm/translations/en';
import { FormRegistrationEmailTranslationsEn } from 'components/Forms/FormRegistrationEmail/translations/en';
import { FormRegistrationPhoneNumberTranslationsEn } from 'components/Forms/FormRegistrationPhoneNumber/translations/en';
import { ModalChangeEmailTranslationsEn } from 'components/Modals/ModalChangeEmail/translations/en';
import { ModalRegisterTranslationsEn } from 'components/Modals/ModalRegister/translations/en';
import { UserPageTranslationsEn } from 'pages/UserPage/translations/en';
import { ModalAddAvatarTranslationsEn } from 'components/Modals/ModalAddAvatar/translations/en';
import { ModalChangePasswordTranslationsEn } from 'components/Modals/ModalChangePassword/translations/en';
import { ModalChangePhoneNumberTranslationsEn } from 'components/Modals/ModalChangePhoneNumber/translations/en';
import { ModalChangePhotoTranslationsEn } from 'components/Modals/ModalChangePhoto/translations/en';
import { ModalLogOutTranslationsEn } from 'components/Modals/ModalLogOut/translations/en';
import { ModalChangeNicknameTranslationsEn } from 'components/Modals/ModalChangeNickname/translations/en';
import { ModalResetPasswordTranslationsEn } from 'components/Modals/ModalResetPassword/translations/en';

export const ComponentTranslationsEn = {
  // forms
  formRegistrationEmail: FormRegistrationEmailTranslationsEn,
  formRegistrationPhoneNumber: FormRegistrationPhoneNumberTranslationsEn,
  authForm: AuthFormTranslationsEn,

  // modals
  modalResetPassword: ModalResetPasswordTranslationsEn,
  modalChangeNickname: ModalChangeNicknameTranslationsEn,
  modalLogOut: ModalLogOutTranslationsEn,
  modalChangePhoto: ModalChangePhotoTranslationsEn,
  modalChangePhoneNumber: ModalChangePhoneNumberTranslationsEn,
  modalChangePassword: ModalChangePasswordTranslationsEn,
  modalAddAvatar: ModalAddAvatarTranslationsEn,
  modalRegister: ModalRegisterTranslationsEn,
  modalChangeEmail: ModalChangeEmailTranslationsEn,


  sectionHero: SectionHeroTranslationsEn,
  sectionAboutUs: SectionAboutUsTranslationsEn,
  sectionOurMission: SectionOurMissionTranslationsEn,
  ...UserPageTranslationsEn,

};
