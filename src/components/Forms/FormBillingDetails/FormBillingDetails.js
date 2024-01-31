import { updateUserBillingDetails } from '../../../redux/auth/operations';
import { validationBillingDetailsScheme } from 'schemas';
import {
  ButtonLabel,
  StyledForm,
  WrapInput,
} from './FormBillingDetails.styled';
import { InputModal, LabelModal } from 'components/Modals/Modal.styled';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../Form.styled';
import { WrapButton } from 'components/Modals/ModalRegister/ModalRegister.styled';
import Button from 'components/Button/Button';
import { BeatLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';

const { Formik, Field } = require('formik');
const { useAuth } = require('hooks');

const FormBillingDetails = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formBillingDetails',
  });

  const { user, isLoading } = useAuth();
  const dispatch = useDispatch();

  const handleSubmit = e => {
    dispatch(updateUserBillingDetails(e));
  };
  return (
    <Formik
      initialValues={{
        name: user?.billingDetails?.name || '',
        street: user?.billingDetails?.street || '',
        city: user?.billingDetails?.city || '',
        zip: user?.billingDetails?.zip || '',
        сountry: user?.billingDetails?.country || 'Česká republika',
        companyID: user?.billingDetails?.companyID || '',
        VATID: user?.billingDetails?.VATID || '',
        vatMode: user?.billingDetails?.vatMode || 'non_vat_payer',
      }}
      validationSchema={validationBillingDetailsScheme}
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
        return (
          <StyledForm onSubmit={handleSubmit}>
            <WrapInput>
              <LabelModal>
                {t('Name')}*
                <InputModal
                  value={values.name}
                  type="text"
                  name="name"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="Karina Stryzhka"
                  required
                />
                <ErrorMessage>
                  {errors.name && touched.name && errors.name}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('Street')}*
                <InputModal
                  value={values.street}
                  type="text"
                  name="street"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="Kytlicka 862/2"
                  required
                />
                <ErrorMessage>
                  {errors.street && touched.street && errors.street}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('City')}*
                <InputModal
                  value={values.city}
                  type="text"
                  name="city"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="Praha"
                  required
                />
                <ErrorMessage>
                  {errors.city && touched.city && errors.city}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('ZIP')}*
                <InputModal
                  value={values.zip}
                  type="text"
                  name="zip"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="19000"
                  required
                />
                <ErrorMessage>
                  {errors.zip && touched.zip && errors.zip}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('Country')}
                <InputModal
                  value=""
                  type="text"
                  name="сountry"
                  placeholder="Česká republika"
                  disabled
                />
                <ErrorMessage>
                  {errors.сountry && touched.сountry && errors.сountry}
                </ErrorMessage>
              </LabelModal>

              <LabelModal
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Field
                  style={{ display: 'none' }}
                  type="radio"
                  id="non_vat_payer"
                  name="vatMode"
                  value="non_vat_payer"
                />
                <ButtonLabel
                  $active={values.vatMode === 'non_vat_payer'}
                  htmlFor="non_vat_payer"
                >
                  {t('NonVATPayer')}
                </ButtonLabel>
                <Field
                  style={{ display: 'none' }}
                  type="radio"
                  id="identified_person"
                  name="vatMode"
                  value="identified_person"
                />
                <ButtonLabel
                  $active={values.vatMode === 'identified_person'}
                  htmlFor="identified_person"
                >
                  {t('IdentifiedPerson')}
                </ButtonLabel>
                <Field
                  style={{ display: 'none' }}
                  type="radio"
                  id="vat_payer"
                  name="vatMode"
                  value="vat_payer"
                />
                <ButtonLabel
                  $active={values.vatMode === 'vat_payer'}
                  htmlFor="vat_payer"
                >
                  {t('VATPayer')}
                </ButtonLabel>
              </LabelModal>

              <LabelModal>
                {t('CompanyID')}
                <InputModal
                  value={values.companyID}
                  type="text"
                  name="companyID"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="Praha"
                />
                <ErrorMessage>
                  {errors.companyID && touched.companyID && errors.companyID}
                </ErrorMessage>
              </LabelModal>

              <LabelModal>
                {t('VATID')}
                <InputModal
                  value={values.VATID}
                  type="text"
                  name="VATID"
                  onChange={e => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="Praha"
                />
                <ErrorMessage>
                  {errors.VATID && touched.VATID && errors.VATID}
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

export default FormBillingDetails;
