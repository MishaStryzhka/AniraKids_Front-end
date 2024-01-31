import { Formik } from 'formik';
import { useAuth } from 'hooks';
import { useTranslation } from 'react-i18next';
import {
  StyledForm,
  WrapInput,
} from '../FormBillingDetails/FormBillingDetails.styled';
import { InputModal, LabelModal } from 'components/Modals/Modal.styled';
import { ErrorMessage } from '../Form.styled';
import { validationBankAccountScheme } from 'schemas';
import { WrapButton } from 'components/SectionAboutAniraK/SectionAboutAniraK.styled';
import Button from 'components/Button/Button';
import { BeatLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { updateUserBankAccount } from '../../../redux/auth/operations';

const FormBankAccount = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formBankAccount',
  });
  const dispatch = useDispatch();
  const { user, isLoading } = useAuth();
  console.log('user', user);

  const handleSubmit = e => {
    dispatch(updateUserBankAccount(e));
  };

  return (
    <Formik
      initialValues={{
        accountName: user.bankAccount.accountName || '',
        accountNumber: user.bankAccount.accountNumber || '',
        IBAN: user.bankAccount.IBAN || '',
        swiftBIC: user.bankAccount.swiftBIC || '',
        currency: 'CZK - Česká republika',
      }}
      validationSchema={validationBankAccountScheme}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => {
        console.log('errors', errors);

        return (
          <StyledForm onSubmit={handleSubmit}>
            <WrapInput>
              <LabelModal>
                {t('accountName')}*
                <InputModal
                  value={values.accountName}
                  type="text"
                  name="accountName"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="Komerční Banka"
                  required
                />
                <ErrorMessage>
                  {errors.accountName &&
                    touched.accountName &&
                    t(errors.accountName)}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('accountNumber')}*
                <InputModal
                  value={values.accountNumber}
                  type="text"
                  name="accountNumber"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="1234567890/2010"
                  required
                />
                <ErrorMessage>
                  {errors.accountNumber &&
                    touched.accountNumber &&
                    t(errors.accountNumber)}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('IBAN')}*
                <InputModal
                  value={values.IBAN}
                  type="text"
                  name="IBAN"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="CZ6508000000192000145399"
                  required
                />
                <ErrorMessage>
                  {errors.IBAN && touched.IBAN && t(errors.IBAN)}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('swiftBIC')}*
                <InputModal
                  value={values.swiftBIC}
                  type="text"
                  name="swiftBIC"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="KOMBCZPP"
                  required
                />
                <ErrorMessage>
                  {errors.swiftBIC && touched.swiftBIC && t(errors.swiftBIC)}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('currency')}
                <InputModal
                  value="CZK - Česká republika"
                  type="text"
                  name="currency"
                  placeholder="CZK - Česká republika"
                  disabled
                />
                <ErrorMessage>
                  {errors.currency && touched.currency && t(errors.currency)}
                </ErrorMessage>
              </LabelModal>
            </WrapInput>
            <WrapButton>
              <Button type="submit" disabled={isLoading}>
                {!isLoading ? t('Continue') : <BeatLoader color="#fff" />}
              </Button>
            </WrapButton>
          </StyledForm>
        );
      }}
    </Formik>
  );
};

export default FormBankAccount;
