import { SectionHeroTranslationsUk } from 'components/SectionHero/translations/uk';
import { SectionAboutUsTranslationsUk } from 'components/SectionAboutUs/translations/uk';
import { SectionOurMissionTranslationsUk } from 'components/SectionOurMission/translations/uk';
import { AuthFormTranslationsUk } from 'components/Forms/AuthForm/translations/uk';
import { FormRegistrationEmailTranslationsUk } from 'components/Forms/FormRegistrationEmail/translations/uk';
import { FormRegistrationPhoneNumberTranslationsUk } from 'components/Forms/FormRegistrationPhoneNumber/translations/uk';
import { ModalChangeEmailTranslationsUk } from 'components/Modals/ModalChangeEmail/translations/uk';
import { ModalRegisterTranslationsUk } from 'components/Modals/ModalRegister/translations/uk';
import { UserPageTranslationsUk } from 'pages/UserPage/translations/uk';
import { ModalAddAvatarTranslationsUk } from 'components/Modals/ModalAddAvatar/translations/uk';
import { ModalChangePasswordTranslationsUk } from 'components/Modals/ModalChangePassword/translations/uk';
import { ModalChangePhoneNumberTranslationsUk } from 'components/Modals/ModalChangePhoneNumber/translations/uk';
import { ModalChangePhotoTranslationsUk } from 'components/Modals/ModalChangePhoto/translations/uk';
import { ModalLogOutTranslationsUk } from 'components/Modals/ModalLogOut/translations/uk';
import { ModalChangeNicknameTranslationsUk } from 'components/Modals/ModalChangeNickname/translations/uk';
import { ModalResetPasswordTranslationsUk } from 'components/Modals/ModalResetPassword/translations/uk';

export const ComponentTranslationsUk = {
  // forms
  formRegistrationEmail: FormRegistrationEmailTranslationsUk,
  formRegistrationPhoneNumber: FormRegistrationPhoneNumberTranslationsUk,
  authForm: AuthFormTranslationsUk,

  // modals
  modalResetPassword: ModalResetPasswordTranslationsUk,
  modalChangeNickname: ModalChangeNicknameTranslationsUk,
  modalLogOut: ModalLogOutTranslationsUk,
  modalChangePhoto: ModalChangePhotoTranslationsUk,
  modalChangePhoneNumber: ModalChangePhoneNumberTranslationsUk,
  modalChangePassword: ModalChangePasswordTranslationsUk,
  modalAddAvatar: ModalAddAvatarTranslationsUk,
  modalChangeEmail: ModalChangeEmailTranslationsUk,
  modalRegister: ModalRegisterTranslationsUk,


  sectionHero: SectionHeroTranslationsUk,
  sectionAboutUs: SectionAboutUsTranslationsUk,
  sectionOurMission: SectionOurMissionTranslationsUk,
  ...UserPageTranslationsUk,

};
