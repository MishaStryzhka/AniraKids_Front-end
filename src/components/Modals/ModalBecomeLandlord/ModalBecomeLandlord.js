import { Field, Formik } from 'formik';
import {
  InputModal,
  LabelModal,
  ModalDescription,
  ModalTitle,
  ModalWindow,
  TextDone,
} from '../Modal.styled';
import { StyledIconCross } from '../ModalLogOut/ModalLogOut.styled';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'hooks';
import { useDispatch } from 'react-redux';
import { WrapButton } from '../ModalRegister/ModalRegister.styled';
import { BeatLoader } from 'react-spinners';
import { validModalBecomeLandlordScheme } from 'schemas';
import { StyledForm, WrapInput } from './ModalBecomeLandlord.styled';
import Button from 'components/Button/Button';
import { ErrorMessage } from 'components/Forms/Form.styled';

const ModalBecomeLandlord = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalBecomeLandlord',
  });
  const { isLoading, error, isDone } = useAuth();
  const dispatch = useDispatch();

  false && console.log('error', error);
  false && dispatch();

  const handleSubmit = e => {
    console.log('e', e);
  };

  return (
    <ModalWindow width="448px">
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <Formik
        initialValues={{
          name: '',
          street: '',
          city: '',
          zip: '',
          сountry: 'Česká republika',
          companyID: '',
          VATID: '',
          vatMode: 'NonVATPayer',
        }}
        validationSchema={validModalBecomeLandlordScheme}
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
          console.log('values', values);

          return isDone ? (
            <TextDone>
              {t('changeEmailMessage', { email: values.email })}
            </TextDone>
          ) : (
            <StyledForm onSubmit={handleSubmit}>
              <ModalTitle>{t('becomeLandlord')}</ModalTitle>
              <ModalDescription>{t('fillBillingDetails')}</ModalDescription>
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
                    placeholder="Praha"
                    required
                  />
                  <ErrorMessage>
                    {errors.zip && touched.zip && errors.zip}
                  </ErrorMessage>
                </LabelModal>

                <LabelModal>
                  {t('Country')}
                  <InputModal
                    value={values.сountry}
                    type="text"
                    name="сountry"
                    onChange={e => {
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    placeholder="Praha"
                    disabled
                  />
                  <ErrorMessage>
                    {errors.сountry && touched.сountry && errors.сountry}
                  </ErrorMessage>
                </LabelModal>

                <LabelModal>
                  <Field
                    style={{ display: 'none' }}
                    type="radio"
                    id="non_vat_payer"
                    name="vatMode"
                    value="non_vat_payer"
                    checked
                  />
                  <label htmlFor="non_vat_payer">{t('NonVATPayer')}</label>
                  <Field
                    style={{ display: 'none' }}
                    type="radio"
                    id="identified_person"
                    name="vatMode"
                    value="identified_person"
                  />
                  <label htmlFor="identified_person">
                    {t('IdentifiedPerson')}
                  </label>
                  <Field
                    style={{ display: 'none' }}
                    type="radio"
                    id="vat_payer"
                    name="vatMode"
                    value="vat_payer"
                  />
                  <label htmlFor="vat_payer">{t('VATPayer')}</label>
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
    </ModalWindow>
  );
};

export default ModalBecomeLandlord;
