import { Field, Formik } from 'formik';
import { validationProfileSchema } from 'schemas';
import {
  Avatar,
  AvatarDescription,
  AvatarLabel,
  AvatarWrap,
  AvaterTitle,
  ProfileForm,
  Wrap,
} from './Profile.styled';
import AvatarImage from '../../../../images/photo-plug.jpg';
import { useState } from 'react';
import Modal from 'components/Modals/Modal';
import ModalAddAvatar from 'components/Modals/ModalAddAvatar/ModalAddAvatar';

const Profile = () => {
  const [avatar, setAvatar] = useState(null);
  const [isOpenModalAddAvatar, setIsOpenModalAddAvatar] = useState(false);

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
        avatarUrl: '',
        firstName: '',
        lastName: '',
        patronymic: '',
        nikname: '', //schemas
        primaryPhoneNumber: '',
        email: '',
        newPassword: '',
        confirmNewPassword: '',
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
              <p>ПІБ</p>
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
