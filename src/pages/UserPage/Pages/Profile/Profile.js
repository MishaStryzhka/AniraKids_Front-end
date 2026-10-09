import { Field, Formik } from 'formik';
import { validationProfileSchema } from 'schemas';
import {
  Avatar,
  AvatarDescription,
  AvatarLabel,
  AvatarWrap,
  ButtonEdit,
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
import ModalChangeEmail from 'components/Modals/ModalChangeEmail/ModalChangeEmail';
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
  const { user, isLoading } = useAuth();
  let { error, isDone } = useAuth();

  const [saveMessage, setSaveMessage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isOpenModalAddAvatar, setIsOpenModalAddAvatar] = useState(false);
  const [isOpenModalChangeEmail, setIsOpenModalChangeEmail] = useState(false);
  const [isOpenModalBecomeLandlord, setIsOpenModalBecomeLandlord] =
    useState(false);

  const [isOpenBillingDetails, setIsOpenBillingDetails] = useState(false);
  const [isOpenBankAccount, setIsOpenBankAccount] = useState(false);


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

  if (!user) {
    return null;
  }

  const isChangeAvatarUrl = e => {
    const { files } = e.currentTarget;
    setAvatar(files[0]);
    setIsOpenModalAddAvatar(true);
  };

  const onSubmit = async (values, { resetForm }) => {
    setSaveMessage(null);
    try {
      await dispatch(updateUserInfo(values)).unwrap();
      resetForm({ values });
      setSaveMessage({ ok: true, text: 'Změny byly uloženy.' });
    } catch (failure) {
      const messages = {
        'Nickname must be unique': 'Tato přezdívka je již obsazená.',
        'Email in use': 'Tento e-mail je již používán.',
        'Phone number in use': 'Toto telefonní číslo je již používáno.',
        'Use the email change flow': 'E-mail změňte pomocí tlačítka s tužkou.',
        'Use the password reset flow': 'Pro nastavení hesla použijte odkaz Zapomněl(a) jsem své heslo.',
      };
      setSaveMessage({ ok: false, text: messages[failure?.message] || 'Údaje se nepodařilo uložit. Zkontrolujte vyplněná pole a zkuste to znovu.' });
    }
  };

  const verifyEmail = async () => {
    setSaveMessage(null);
    try { await dispatch(verifiedEmail()).unwrap(); }
    catch (failure) { setSaveMessage({ ok: false, text: failure?.status === 429 ? 'Před dalším odesláním prosím vyčkejte jednu minutu.' : 'Potvrzovací e-mail se nepodařilo odeslat. Zkuste to znovu.' }); }
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
          primaryPhoneNumber: user?.primaryPhoneNumber || '',
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
          dirty,
          isSubmitting,
        }) => {
          return (
            <ProfileForm>
              <Wrap>
                {['lastName', 'firstName', 'nickname'].map(field => (
                  <Label key={field}>
                    <Placeholder>{field === 'nickname' ? 'Nickname' : t(field)}</Placeholder>
                    <InputField type="text" id={field} name={field} value={values[field]} disabled={isLoading}
                      onChange={handleChange} onBlur={handleBlur}
                      autoComplete={field === 'firstName' ? 'given-name' : field === 'lastName' ? 'family-name' : 'nickname'} />
                    <ErrorMessage>{touched[field] && errors[field] ? t(errors[field]) : ''}</ErrorMessage>
                  </Label>
                ))}

                <Label>
                  <Placeholder>{t('phoneNumber')}</Placeholder>
                  <InputField type="tel" autoComplete="tel" id="primaryPhoneNumber" name="primaryPhoneNumber"
                    value={values.primaryPhoneNumber} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} placeholder="+420777123456" />
                  <ErrorMessage>{touched.primaryPhoneNumber && errors.primaryPhoneNumber ? t(errors.primaryPhoneNumber) : ''}</ErrorMessage>
                </Label>

                <Label as="div">
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
                        title="Změnit e-mail"
                        aria-label="Změnit e-mail"
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
                        Potvrzovací odkaz jsme poslali na {values.email}. Odkaz platí 30 minut.
                      </TextDone>
                    </Modal>
                  )}
                </Label>

                <a href="/refreshPassword">Nastavit nebo obnovit heslo</a>

                {saveMessage && (
                  <p role={saveMessage.ok ? 'status' : 'alert'} style={{ color: saveMessage.ok ? '#276749' : '#b42318' }}>{saveMessage.text}</p>
                )}
                {(
                  <StyledButton
                    type="submit"
                    title={t('saveChanges')}
                    disabled={!dirty || isSubmitting || isLoading}
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
