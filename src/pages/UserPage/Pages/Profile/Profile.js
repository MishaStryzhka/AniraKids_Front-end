import { Field, Formik } from 'formik';
import { validationProfileSchema } from 'schemas';
import {
  Avatar,
  AvatarDescription,
  AvatarLabel,
  AvatarWrap,
  AvaterTitle,
  ButtonEdit,
  ButtonShow,
  InputText,
  Label,
  Placeholder,
  ProfileForm,
  StyledButton,
  Wrap,
  Wrapper,
} from './Profile.styled';
import AvatarImage from '../../../../images/photo-plug.jpg';
import { useState } from 'react';
import Modal from 'components/Modals/Modal';
import ModalAddAvatar from 'components/Modals/ModalAddAvatar/ModalAddAvatar';
import { useAuth } from 'hooks';
import { InputField } from 'components/Forms/Form.styled';
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

const Profile = () => {
  const { user, currentTheme } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [isOpenModalAddAvatar, setIsOpenModalAddAvatar] = useState(false);
  const [isOpenModalChangePhoneNomber, setIsOpenModalChangePhoneNomber] =
    useState(false);
  const [isOpenModalChangeEmail, setIsOpenModalChangeEmail] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const dispatch = useDispatch();

  const isChangeAvatarUrl = e => {
    const { files } = e.currentTarget;
    setAvatar(files[0]);
    setIsOpenModalAddAvatar(true);
  };

  const onSubmit = e => {
    console.log('e', e);
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
        patronymic: user?.patronymic || '',
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
                <Placeholder>Прізвище</Placeholder>
                {user?.firstName ? (
                  <InputText>{user?.firstName}</InputText>
                ) : (
                  <InputField
                    type="text"
                    id="firstName"
                    value={values.firstName}
                    name="firstName"
                    placeholder="Стрижка"
                    onChange={handleChange}
                  />
                )}
              </Label>

              <Label>
                <Placeholder>Ім'я</Placeholder>
                {user?.lastName ? (
                  <InputText>{user?.lastName}</InputText>
                ) : (
                  <InputField
                    type="text"
                    id="lastName"
                    value={values.lastName}
                    name="lastName"
                    placeholder="Каріна"
                    onChange={handleChange}
                  />
                )}
              </Label>

              <Label>
                <Placeholder>Побатькові (необов'язково)</Placeholder>
                {user?.patronymic ? (
                  <InputText>{user?.patronymic}</InputText>
                ) : (
                  <InputField
                    type="text"
                    id="patronymic"
                    value={values.patronymic}
                    name="patronymic"
                    placeholder="Михайлівна"
                    onChange={handleChange}
                  />
                )}
              </Label>

              {/* <Label>
                <Placeholder>Назва компанії</Placeholder>
                {user?.companyName ? (
                  <InputText>{user?.companyName}</InputText>
                ) : (
                  <InputField
                    type="text"
                    id="companyName"
                    value={values.companyName}
                    name="companyName"
                    placeholder="aniraKids"
                    onChange={handleChange}
                  />
                )}
              </Label> */}

              {/* <Label>
                <Placeholder>IČO</Placeholder>
                {user?.ico ? (
                  <InputText>{user?.ico}</InputText>
                ) : (
                  <InputField
                    type="number"
                    id="ico"
                    value={values.ico}
                    name="ico"
                    placeholder="19970561"
                    onChange={handleChange}
                  />
                )}
              </Label> */}

              <Label>
                <Placeholder>Nickname</Placeholder>
                {user?.nickname ? (
                  <InputText>{user?.nickname}</InputText>
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

                      handleChange(e);
                    }}
                  />
                )}
              </Label>

              <Label>
                <Placeholder>Номер телефону</Placeholder>
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
                    onChange={handleChange}
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
                <Placeholder>Електронна пошта</Placeholder>
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
                      <p>Верифіковано</p>
                    ) : (
                      <button
                        type="buttom"
                        title="Верифікувати пошту"
                        onClick={() => verifyEmail()}
                      >
                        Верифікувати
                      </button>
                    )}
                  </Wrapper>
                ) : (
                  <InputField
                    type="email"
                    id="email"
                    value={values.email}
                    name="email"
                    placeholder="***@gmail.com"
                    onChange={handleChange}
                  />
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
                    <Placeholder>Новий пароль</Placeholder>
                    <InputField
                      type={!showNewPassword ? 'password' : 'text'}
                      id="newPassword"
                      value={values.newPassword}
                      name="newPassword"
                      placeholder="********"
                      onChange={handleChange}
                    />
                    {values.newPassword !== '' && (
                      <ButtonShow
                        type="button"
                        title="show password"
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
                    <Placeholder>Введіть новий пароль ще раз</Placeholder>
                    <InputField
                      type={!showConfirmNewPassword ? 'password' : 'text'}
                      id="confirmNewPassword"
                      value={values.confirmNewPassword}
                      name="confirmNewPassword"
                      placeholder="********"
                      onChange={handleChange}
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

              {Object.entries(touched).length !== 0 && (
                <StyledButton type="submit" title="ЗБЕРЕГТИ">
                  ЗБЕРЕГТИ
                </StyledButton>
              )}
            </Wrap>
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
              <AvaterTitle>Фото профілю</AvaterTitle>
              <AvatarDescription>Максимальний розмір - 5 Мб</AvatarDescription>
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
          </ProfileForm>
        );
      }}
    </Formik>
  );
};

export default Profile;
