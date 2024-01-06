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
import IconEye from 'images/icons/IconEye';
import IconEyeOff from 'images/icons/IconEyeOff';

const Profile = () => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [isOpenModalAddAvatar, setIsOpenModalAddAvatar] = useState(false);
  const [isOpenModalChangePhoneNomber, setIsOpenModalChangePhoneNomber] =
    useState(false);
  const [isOpenModalChangeEmail, setIsOpenModalChangeEmail] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const isChangeAvatarUrl = e => {
    const { files } = e.currentTarget;
    setAvatar(files[0]);
    setIsOpenModalAddAvatar(true);
  };

  const onSubmit = e => {
    console.log('e', e);
  };

  return (
    <Formik
      initialValues={{
        avatarUrl: user.avatarUrl || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        patronymic: user.patronymic || '',
        nickname: user.nickname || '', //schemas
        primaryPhoneNumber: '',
        email: user.email || '',
        newPassword: user.newPassword || '',
        confirmNewPassword: user.confirmNewPassword || '',
      }}
      validationSchema={validationProfileSchema}
      onSubmit={({ email, password, userType }) =>
        onSubmit({
          email,
          password,
        })
      }
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => {
        console.log('values', values);

        return (
          <ProfileForm>
            <Wrap>
              <Label>
                <Placeholder>Прізвище</Placeholder>
                <InputField
                  type="text"
                  id="firstName"
                  value={values.firstName}
                  name="firstName"
                  placeholder="Стрижка"
                  onChange={handleChange}
                />
              </Label>

              <Label>
                <Placeholder>Ім'я</Placeholder>
                <InputField
                  type="text"
                  id="lastName"
                  value={values.lastName}
                  name="lastName"
                  placeholder="Каріна"
                  onChange={handleChange}
                />
              </Label>

              <Label>
                <Placeholder>Побатькові (необов'язково)</Placeholder>
                <InputField
                  type="text"
                  id="patronymic"
                  value={values.patronymic}
                  name="patronymic"
                  placeholder="Михайлівна"
                  onChange={handleChange}
                />
              </Label>

              <Label>
                <Placeholder>Nickname</Placeholder>
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
              </Label>

              <Label>
                <Placeholder>Номер телефону</Placeholder>
                {user.primaryPhoneNumber ? (
                  <Wrapper>
                    <InputText>{user.primaryPhoneNumber}</InputText>
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
                  <Modal>
                    <ModalChangePhoneNumber
                      onClose={() => setIsOpenModalChangePhoneNomber(false)}
                    ></ModalChangePhoneNumber>
                  </Modal>
                )}
              </Label>

              <Label>
                <Placeholder>Електронна пошта</Placeholder>
                {user.email ? (
                  <Wrapper>
                    <InputText>{user.email}</InputText>
                    <ButtonEdit
                      type="button"
                      title="change email"
                      onClick={() => setIsOpenModalChangeEmail(true)}
                    >
                      <IconPencil />
                    </ButtonEdit>
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
                  <Modal>
                    <ModalChangeEmail
                      onClose={() => setIsOpenModalChangeEmail(false)}
                    ></ModalChangeEmail>
                  </Modal>
                )}
              </Label>

              <Label>
                <Placeholder>Новий пароль</Placeholder>
                <InputField
                  type={showNewPassword ? 'password' : 'text'}
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
                    {showNewPassword ? <IconEye /> : <IconEyeOff />}
                  </ButtonShow>
                )}
              </Label>

              <Label>
                <Placeholder>Введіть новий пароль ще раз</Placeholder>
                <InputField
                  type={showConfirmNewPassword ? 'password' : 'text'}
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
                    {showConfirmNewPassword ? <IconEye /> : <IconEyeOff />}
                  </ButtonShow>
                )}
              </Label>
            </Wrap>
            <AvatarLabel>
              <Field
                style={{ display: 'none' }}
                type="file"
                id="avatarUrl"
                value=""
                name="avatarUrl"
                onChange={e => {
                  isChangeAvatarUrl(e);
                }}
              />
              <AvatarWrap $avatar={values.avatarUrl} htmlFor="avatarUrl">
                {values.avatarUrl ? (
                  <Avatar
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
