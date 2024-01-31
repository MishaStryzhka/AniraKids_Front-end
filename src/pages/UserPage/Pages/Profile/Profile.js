import { Field, Formik } from 'formik';
import { validationProfileSchema } from 'schemas';
import {
  Avatar,
  AvatarDescription,
  AvatarLabel,
  AvatarWrap,
  ButtonEdit,
  ButtonShow,
  InputText,
  Label,
  Placeholder,
  ProfileForm,
  SecondWrap,
  StyledButton,
  Wrap,
  Wrapper,
} from './Profile.styled';
import AvatarImage from '../../../../images/photo-plug.jpg';
import { useState } from 'react';
import Modal from 'components/Modals/Modal';
import ModalAddAvatar from 'components/Modals/ModalAddAvatar/ModalAddAvatar';
import { useAuth } from 'hooks';
import { ErrorMessage, InputField } from 'components/Forms/Form.styled';
import ModalChangePhoneNumber from 'components/Modals/ModalChangePhoneNumber/ModalChangePhoneNumber';
import IconPencil from 'images/icons/IconPencil';
import ModalChangeEmail from 'components/Modals/ModalChangeEmail/ModalChangeEmail';
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useDispatch } from 'react-redux';
import {
  confirmUserEmail,
  updateUserInfo,
} from '../../../../redux/auth/operations';
import { useTranslation } from 'react-i18next';
import { StyledSecondButton } from 'components/NavigationOverlay/NavigationOverlay.styled';
import ModalBecomeLandlord from 'components/Modals/ModalBecomeLandlord/ModalBecomeLandlord';
import { BeatLoader } from 'react-spinners';

const Profile = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.userPage.profilePage',
  });
  const { user, currentTheme, isLoading } = useAuth();
  let { error } = useAuth();

  const [avatar, setAvatar] = useState(null);
  const [isOpenModalAddAvatar, setIsOpenModalAddAvatar] = useState(false);
  const [isOpenModalChangePhoneNomber, setIsOpenModalChangePhoneNomber] =
    useState(false);
  const [isOpenModalChangeEmail, setIsOpenModalChangeEmail] = useState(false);
  const [isOpenModalBecomeLandlord, setIsOpenModalBecomeLandlord] =
    useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const dispatch = useDispatch();

  const isChangeAvatarUrl = e => {
    const { files } = e.currentTarget;
    setAvatar(files[0]);
    setIsOpenModalAddAvatar(true);
  };

  const onSubmit = e => {
    dispatch(updateUserInfo(e));
  };

  const verifyEmail = () => {
    dispatch(confirmUserEmail());
  };

  return (
    <Formik
      initialValues={{
        avatarUrl: user?.avatar || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        companyName: user?.companyName || '',
        nickname: user?.nickname || '',
        primaryPhoneNumber: '',
        email: user?.email || '',
        newPassword: user?.newPassword || '',
        confirmNewPassword: user?.confirmNewPassword || '',
        ico: user?.ico || '',
      }}
      validationSchema={validationProfileSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        setTouched,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => {
        console.log('errors', errors);

        return (
          <ProfileForm>
            <Wrap>
              <Label>
                <Placeholder>{t('lastName')}</Placeholder>
                {user?.lastName ? (
                  <Wrapper>
                    <InputText>{user?.lastName}</InputText>
                  </Wrapper>
                ) : (
                  <InputField
                    type="text"
                    id="lastName"
                    value={values.lastName}
                    name="lastName"
                    placeholder="Каріна"
                    onChange={e => {
                      error = null;
                      handleChange(e);
                    }}
                  />
                )}
              </Label>

              <Label>
                <Placeholder>{t('firstName')}</Placeholder>
                {user?.firstName ? (
                  <Wrapper>
                    <InputText>{user?.firstName}</InputText>
                  </Wrapper>
                ) : (
                  <InputField
                    type="text"
                    id="firstName"
                    value={values.firstName}
                    name="firstName"
                    placeholder="Стрижка"
                    onChange={e => {
                      error = null;
                      handleChange(e);
                    }}
                  />
                )}
              </Label>

              <Label>
                <Placeholder>Nickname</Placeholder>
                {user?.nickname ? (
                  <Wrapper>
                    <InputText>{user?.nickname}</InputText>
                  </Wrapper>
                ) : (
                  <InputField
                    type="text"
                    id="nickname"
                    value={values.nickname}
                    name="nickname"
                    placeholder="@karina.s"
                    onChange={e => {
                      e.currentTarget.value =
                        e.currentTarget.value.replaceAll('@', '').length < 1
                          ? ''
                          : `@${e.currentTarget.value.replaceAll('@', '')}`;
                      error = null;
                      handleChange(e);
                    }}
                  />
                )}
                {error?.message === 'Nickname must be unique' && (
                  <ErrorMessage>{t('Nickname must be unique')}</ErrorMessage>
                )}
              </Label>

              <Label>
                <Placeholder>{t('phoneNumber')}</Placeholder>
                {user?.primaryPhoneNumber ? (
                  <Wrapper>
                    <InputText>{user?.primaryPhoneNumber}</InputText>
                    <ButtonEdit
                      type="button"
                      title="change phone number"
                      onClick={() => setIsOpenModalChangePhoneNomber(true)}
                    >
                      <IconPencil />
                    </ButtonEdit>
                  </Wrapper>
                ) : (
                  <InputField
                    type="text"
                    id="primaryPhoneNumber"
                    value={values.primaryPhoneNumber}
                    name="primaryPhoneNumber"
                    placeholder="+380"
                    onChange={e => {
                      error = null;
                      handleChange(e);
                    }}
                  />
                )}
                {isOpenModalChangePhoneNomber && (
                  <Modal onClick={() => setIsOpenModalChangePhoneNomber(false)}>
                    <ModalChangePhoneNumber
                      onClick={() => setIsOpenModalChangePhoneNomber(false)}
                    ></ModalChangePhoneNumber>
                  </Modal>
                )}
              </Label>

              <Label>
                <Placeholder>{t('email')}</Placeholder>
                {user?.email ? (
                  <Wrapper>
                    <InputText>{user?.email}</InputText>
                    <ButtonEdit
                      type="button"
                      title="change email"
                      onClick={() => setIsOpenModalChangeEmail(true)}
                    >
                      <IconPencil />
                    </ButtonEdit>
                    {user.emailVerified ? (
                      <p>{t('verified')}</p>
                    ) : (
                      <button
                        type="buttom"
                        title="Верифікувати пошту"
                        onClick={() => verifyEmail()}
                      >
                        {t('verify')}
                      </button>
                    )}
                  </Wrapper>
                ) : (
                  <>
                    <InputField
                      type="email"
                      id="email"
                      value={values.email}
                      name="email"
                      placeholder="***@gmail.com"
                      onChange={e => {
                        error = null;
                        handleChange(e);
                      }}
                    />
                    <ErrorMessage>
                      {(errors?.email && touched?.email && t(errors?.email)) ||
                        (error?.message === 'Email in use' &&
                          t(error?.message))}
                    </ErrorMessage>
                  </>
                )}
                {isOpenModalChangeEmail && (
                  <Modal onClick={() => setIsOpenModalChangeEmail(false)}>
                    <ModalChangeEmail
                      onClick={() => setIsOpenModalChangeEmail(false)}
                    ></ModalChangeEmail>
                  </Modal>
                )}
              </Label>

              {user?.isFirstLogin && user?.provider === 'Google' && (
                <>
                  <Label>
                    <Placeholder>{t('newPassword')}</Placeholder>
                    <InputField
                      type={!showNewPassword ? 'password' : 'text'}
                      id="newPassword"
                      value={values.newPassword}
                      name="newPassword"
                      placeholder="********"
                      onChange={e => {
                        error = null;
                        handleChange(e);
                      }}
                    />
                    {values.newPassword !== '' && (
                      <ButtonShow
                        type="button"
                        title={t('showPassword')}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {!showNewPassword ? (
                          <IconEyeOpen
                            fill={theme[currentTheme].color.mainColor2}
                          />
                        ) : (
                          <IconEyeClosed
                            fill={theme[currentTheme].color.mainColor2}
                          />
                        )}
                      </ButtonShow>
                    )}
                  </Label>

                  <Label>
                    <Placeholder>{t('enterNewPasswordAgain')}</Placeholder>
                    <InputField
                      type={!showConfirmNewPassword ? 'password' : 'text'}
                      id="confirmNewPassword"
                      value={values.confirmNewPassword}
                      name="confirmNewPassword"
                      placeholder="********"
                      onChange={e => {
                        error = null;
                        handleChange(e);
                      }}
                    />
                    {values.confirmNewPassword !== '' && (
                      <ButtonShow
                        type="button"
                        title="show password"
                        onClick={() =>
                          setShowConfirmNewPassword(!showConfirmNewPassword)
                        }
                      >
                        {!showConfirmNewPassword ? (
                          <IconEyeOpen
                            fill={theme[currentTheme].color.mainColor2}
                          />
                        ) : (
                          <IconEyeClosed
                            fill={theme[currentTheme].color.mainColor2}
                          />
                        )}
                      </ButtonShow>
                    )}
                  </Label>
                </>
              )}

              {Object.entries(touched).length !== 0 && user.isFirstLogin && (
                <StyledButton
                  type="submit"
                  title={t('saveChanges')}
                  disabled={isLoading}
                >
                  {!isLoading ? t('saveChanges') : <BeatLoader color="#fff" />}
                </StyledButton>
              )}
            </Wrap>
            <SecondWrap>
              <AvatarLabel>
                <Field
                  style={{ display: 'none' }}
                  type="file"
                  id="avatarUrl"
                  value=""
                  name="avatarUrl"
                  onChange={e => {
                    setTouched({ ...touched, avatarUrl: true });
                    isChangeAvatarUrl(e);
                  }}
                />
                <AvatarWrap $avatar={values.avatarUrl} htmlFor="avatarUrl">
                  {values.avatarUrl ? (
                    <Avatar
                      width={197}
                      height={197}
                      src={
                        typeof values.avatarUrl === 'object'
                          ? URL.createObjectURL(values.avatarUrl)
                          : values.avatarUrl
                      }
                      alt="avatar"
                    />
                  ) : (
                    <img src={AvatarImage} alt="avatar" />
                  )}
                </AvatarWrap>
                <Placeholder>{t('profilePhoto')}</Placeholder>
                <AvatarDescription>{t('maxFileSize')}</AvatarDescription>
                {isOpenModalAddAvatar && (
                  <Modal
                    onClick={() => {
                      setIsOpenModalAddAvatar(false);
                    }}
                  >
                    <ModalAddAvatar
                      avatar={avatar}
                      setFieldValue={setFieldValue}
                      setIsOpenModalAddAvatar={setIsOpenModalAddAvatar}
                    />
                  </Modal>
                )}
              </AvatarLabel>
              <StyledSecondButton
                onClick={() => setIsOpenModalBecomeLandlord(true)}
              >
                {t('BECOME_LANDLORD')}
              </StyledSecondButton>
              {isOpenModalBecomeLandlord && (
                <Modal onClick={() => setIsOpenModalBecomeLandlord(false)}>
                  <ModalBecomeLandlord
                    onClick={() => setIsOpenModalBecomeLandlord(false)}
                  ></ModalBecomeLandlord>
                </Modal>
              )}
            </SecondWrap>
          </ProfileForm>
        );
      }}
    </Formik>
  );
};

export default Profile;