import { Field, Formik } from 'formik';
import { validationProfileSchema } from 'schemas';
import {
  Avatar,
  AvatarDescription,
  AvatarLabel,
  AvatarWrap,
  ButtonEdit,
  ButtonShow,
  ButtonVerify,
  InputText,
  Label,
  Placeholder,
  ProfileForm,
  SecondWrap,
  StyledButton,
  StyledIconPencil,
  Wrap,
  Wrapper,
  WrapperBiling,
} from './Profile.styled';
import AvatarImage from 'images/photo-plug.jpg';
import { useEffect, useState } from 'react';
import Modal from 'components/Modals/Modal';
import ModalAddAvatar from 'components/Modals/ModalAddAvatar/ModalAddAvatar';
import { useAuth } from 'hooks';
import { ErrorMessage, InputField } from 'components/Forms/Form.styled';
import ModalChangePhoneNumber from 'components/Modals/ModalChangePhoneNumber/ModalChangePhoneNumber';
import ModalChangeEmail from 'components/Modals/ModalChangeEmail/ModalChangeEmail';
import IconEyeOpen from 'images/icons/IconEyeOpen';
import IconEyeClosed from 'images/icons/IconEyeClosed';
import theme from 'components/theme';
import { useDispatch } from 'react-redux';
import {
  updateUserInfo,
  verifiedEmail,
} from '../../../../redux/auth/operations';
import { useTranslation } from 'react-i18next';
import ModalBecomeLandlord from 'components/Modals/ModalBecomeLandlord/ModalBecomeLandlord';
import { BeatLoader } from 'react-spinners';
import { clearDone } from '../../../../redux/auth/slice';
import { TextDone } from 'components/Modals/Modal.styled';
import ButtonAdd from 'components/Buttons/ButtonAdd/ButtonAdd';
import {
  SceletonAvatar,
  SceletonDescription,
  SceletonField,
  SceletonFieldInput,
  SceletonText,
} from './SceletonProfile.styled';
import {
  QuestionDescription,
  StyledIconArrowUp,
} from 'components/SectionAnswers/SectionAnswers.styled';
import FormBillingDetails from 'components/Forms/FormBillingDetails/FormBillingDetails';
import FormBankAccount from 'components/Forms/FormBankAccount/FormBankAccount';

const Profile = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.userPage.profilePage',
  });
  const { user, currentTheme, isLoading } = useAuth();
  let { error, isDone } = useAuth();

  const [avatar, setAvatar] = useState(null);
  const [isOpenModalAddAvatar, setIsOpenModalAddAvatar] = useState(false);
  const [isOpenModalChangePhoneNomber, setIsOpenModalChangePhoneNomber] =
    useState(false);
  const [isOpenModalChangeEmail, setIsOpenModalChangeEmail] = useState(false);
  const [isOpenModalBecomeLandlord, setIsOpenModalBecomeLandlord] =
    useState(false);

  const [isOpenBillingDetails, setIsOpenBillingDetails] = useState(false);
  const [isOpenBankAccount, setIsOpenBankAccount] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [
    isOpenModalEmailSentSuccessfully,
    setIsOpenModalEmailSentSuccessfully,
  ] = useState();

  const dispatch = useDispatch();

  useEffect(() => {
    isDone?.message === 'Email confirmation sent successfully.' &&
      setIsOpenModalEmailSentSuccessfully(true);
    isDone &&
      setTimeout(() => {
        dispatch(clearDone());
      }, 5000);
  }, [dispatch, isDone]);

  const isChangeAvatarUrl = e => {
    const { files } = e.currentTarget;
    setAvatar(files[0]);
    setIsOpenModalAddAvatar(true);
  };

  const onSubmit = e => {
    dispatch(updateUserInfo(e));
  };

  const verifyEmail = () => {
    dispatch(verifiedEmail());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          return (
            <ProfileForm>
              <Wrap>
                <Label>
                  {!isLoading ? (
                    <Placeholder>{t('lastName')}</Placeholder>
                  ) : (
                    <SceletonField />
                  )}
                  {user?.lastName ? (
                    <Wrapper>
                      {!isLoading ? (
                        <InputText>{user?.lastName}</InputText>
                      ) : (
                        <SceletonField />
                      )}
                    </Wrapper>
                  ) : (
                    <>
                      {!isLoading ? (
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
                      ) : (
                        <SceletonFieldInput />
                      )}
                      <ErrorMessage>
                        {errors?.lastName &&
                          touched?.lastName &&
                          t(errors?.lastName)}
                      </ErrorMessage>
                    </>
                  )}
                </Label>

                <Label>
                  {!isLoading ? (
                    <Placeholder>{t('firstName')}</Placeholder>
                  ) : (
                    <SceletonField />
                  )}
                  {user?.firstName ? (
                    <Wrapper>
                      {!isLoading ? (
                        <InputText>{user?.firstName}</InputText>
                      ) : (
                        <SceletonField />
                      )}
                    </Wrapper>
                  ) : (
                    <>
                      {!isLoading ? (
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
                      ) : (
                        <SceletonFieldInput />
                      )}
                      <ErrorMessage>
                        {errors?.firstName &&
                          touched?.firstName &&
                          t(errors?.firstName)}
                      </ErrorMessage>
                    </>
                  )}
                </Label>

                <Label>
                  {!isLoading ? (
                    <Placeholder>Nickname</Placeholder>
                  ) : (
                    <SceletonField />
                  )}
                  {user?.nickname ? (
                    <Wrapper>
                      {!isLoading ? (
                        <InputText>{user?.nickname}</InputText>
                      ) : (
                        <SceletonField />
                      )}
                    </Wrapper>
                  ) : (
                    <div>
                      {!isLoading ? (
                        <InputField
                          type="text"
                          id="nickname"
                          value={values.nickname}
                          name="nickname"
                          placeholder="@karina.s"
                          onChange={e => {
                            e.currentTarget.value =
                              e.currentTarget.value.replaceAll('@', '').length <
                              1
                                ? ''
                                : `@${e.currentTarget.value.replaceAll(
                                    '@',
                                    ''
                                  )}`;
                            error = null;
                            handleChange(e);
                          }}
                        />
                      ) : (
                        <SceletonFieldInput />
                      )}
                    </div>
                  )}
                  <ErrorMessage>
                    {(errors?.nickname &&
                      touched?.nickname &&
                      t(errors?.nickname)) ||
                      (error?.message === 'Nickname must be unique' &&
                        t('Nickname must be unique'))}
                  </ErrorMessage>
                </Label>

                <Label>
                  {!isLoading ? (
                    <Placeholder>{t('phoneNumber')}</Placeholder>
                  ) : (
                    <SceletonField />
                  )}
                  {user?.primaryPhoneNumber ? (
                    <Wrapper>
                      {!isLoading ? (
                        <InputText>{user?.primaryPhoneNumber}</InputText>
                      ) : (
                        <SceletonField />
                      )}
                      <ButtonEdit
                        type="button"
                        title="change phone number"
                        onClick={() => setIsOpenModalChangePhoneNomber(true)}
                        disabled={isLoading}
                      >
                        <StyledIconPencil />
                      </ButtonEdit>
                    </Wrapper>
                  ) : (
                    <>
                      {!isLoading ? (
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
                      ) : (
                        <SceletonFieldInput />
                      )}

                      <ErrorMessage>
                        {errors?.primaryPhoneNumber &&
                          touched?.primaryPhoneNumber &&
                          t(errors?.primaryPhoneNumber)}
                      </ErrorMessage>
                    </>
                  )}
                  {isOpenModalChangePhoneNomber && (
                    <Modal
                      onClick={() => setIsOpenModalChangePhoneNomber(false)}
                    >
                      <ModalChangePhoneNumber
                        onClick={() => setIsOpenModalChangePhoneNomber(false)}
                      ></ModalChangePhoneNumber>
                    </Modal>
                  )}
                </Label>

                <Label>
                  {!isLoading ? (
                    <Placeholder>{t('email')}</Placeholder>
                  ) : (
                    <SceletonField />
                  )}
                  {user?.email ? (
                    <Wrapper>
                      {!isLoading ? (
                        <InputText>{user?.email}</InputText>
                      ) : (
                        <SceletonField />
                      )}
                      <ButtonEdit
                        type="button"
                        title="change email"
                        onClick={() => setIsOpenModalChangeEmail(true)}
                        disabled={isLoading}
                      >
                        <StyledIconPencil />
                      </ButtonEdit>
                      {user.emailVerified ? (
                        <p>{t('verified')}</p>
                      ) : (
                        <ButtonVerify
                          type="button"
                          title="verify email"
                          onClick={() => verifyEmail()}
                          disabled={isLoading}
                        >
                          {!isLoading ? (
                            t('verify')
                          ) : (
                            <BeatLoader color="#fff" />
                          )}
                        </ButtonVerify>
                      )}
                    </Wrapper>
                  ) : (
                    <>
                      {!isLoading ? (
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
                      ) : (
                        <SceletonFieldInput />
                      )}
                      <ErrorMessage>
                        {(errors?.email &&
                          touched?.email &&
                          t(errors?.email)) ||
                          (error?.message === 'Email in use' &&
                            t(error?.message))}
                      </ErrorMessage>
                    </>
                  )}
                  {isOpenModalChangeEmail && (
                    <Modal closeModal={() => setIsOpenModalChangeEmail(false)}>
                      <ModalChangeEmail
                        closeModal={() => setIsOpenModalChangeEmail(false)}
                      ></ModalChangeEmail>
                    </Modal>
                  )}
                  {isOpenModalEmailSentSuccessfully && (
                    <Modal
                      closeModal={() =>
                        setIsOpenModalEmailSentSuccessfully(false)
                      }
                    >
                      <TextDone>
                        {t('changeEmailMessage', { email: values.email })}
                      </TextDone>
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

                {((Object.entries(touched).length !== 0 && user.isFirstLogin) ||
                  touched?.avatarUrl) && (
                  <StyledButton
                    type="submit"
                    title={t('saveChanges')}
                    disabled={isLoading}
                  >
                    {!isLoading ? (
                      t('saveChanges')
                    ) : (
                      <BeatLoader color="#fff" />
                    )}
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
                      <>
                        {!isLoading ? (
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
                          <SceletonAvatar />
                        )}
                      </>
                    ) : (
                      <>
                        {!isLoading ? (
                          <img src={AvatarImage} alt="avatar" />
                        ) : (
                          <SceletonAvatar />
                        )}
                      </>
                    )}
                  </AvatarWrap>
                  {!isLoading ? (
                    <Placeholder>{t('profilePhoto')}</Placeholder>
                  ) : (
                    <SceletonText />
                  )}
                  {!isLoading ? (
                    <AvatarDescription>{t('maxFileSize')}</AvatarDescription>
                  ) : (
                    <SceletonDescription />
                  )}
                  {isOpenModalAddAvatar && (
                    <Modal
                      closeModal={() => {
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
                {user.typeUser !== 'owner' && (
                  <>
                    <ButtonAdd
                      onClick={() => setIsOpenModalBecomeLandlord(true)}
                      disabled={isLoading}
                    >
                      {t('BECOME_LANDLORD')}
                    </ButtonAdd>
                  </>
                )}
                {isOpenModalBecomeLandlord && (
                  <Modal
                    prohibitClosingByBackdrop
                    closeModal={() => setIsOpenModalBecomeLandlord(false)}
                  >
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
      {user.typeUser === 'owner' && (
        <>
          <WrapperBiling>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <QuestionDescription>{'BillingDetails'}</QuestionDescription>
              <StyledIconArrowUp
                $openAnswer={isOpenBillingDetails}
                onClick={() => setIsOpenBillingDetails(!isOpenBillingDetails)}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
              }}
            >
              {isOpenBillingDetails && <FormBillingDetails />}
            </div>
          </WrapperBiling>
          <WrapperBiling>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <QuestionDescription>{'BankAccount'}</QuestionDescription>
              <StyledIconArrowUp
                $openAnswer={isOpenBankAccount}
                onClick={() => setIsOpenBankAccount(!isOpenBankAccount)}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
              }}
            >
              {isOpenBankAccount && <FormBankAccount />}
            </div>
          </WrapperBiling>
        </>
      )}
    </div>
  );
};

export default Profile;
