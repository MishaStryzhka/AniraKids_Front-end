import { useTranslation } from 'react-i18next';
import {
  FieldOrder,
  FieldSelect,
  LabelOrder,
  StyledForm,
  TextDescription,
} from './FormOrder.styled';
import { Formik } from 'formik';
import { validationFormOrderScheme } from 'schemas';
import { ErrorMessage } from '../Form.styled';

const FormOrder = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formOrder',
  });

  const handleFormOrderSubmit = (values, { resetForm }) => {
    console.log(values);

    resetForm();
  };
  return (
    <>
      <Formik
        initialValues={{
          fullName: '',
          phoneNumber: '',
          email: '',
          deliveryService: '',
          deliveryType: '',
          city: '',
          address: '',
        }}
        validationSchema={validationFormOrderScheme}
        // validateOnChange={false}
        onSubmit={handleFormOrderSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => (
          <StyledForm onSubmit={handleSubmit}>
            <LabelOrder>
              {t('urerFullName')}*
              <FieldOrder
                name="fullName"
                value={values.fullName}
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Бондаренко А.А."
              />
              {errors.fullName && touched.fullName && (
                <ErrorMessage>{t(errors.fullName)}</ErrorMessage>
              )}
            </LabelOrder>
            <LabelOrder>
              {t('userPhoneNumber')}*
              <FieldOrder
                name="phoneNumber"
                value={values.phoneNumber}
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+380"
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <ErrorMessage>{t(errors.phoneNumber)}</ErrorMessage>
              )}
            </LabelOrder>
            <LabelOrder>
              {t('email')}*
              <FieldOrder
                name="email"
                value={values.email}
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="example@gmail.com"
              />
              {errors.email && touched.email && (
                <ErrorMessage>{t(errors.email)}</ErrorMessage>
              )}
            </LabelOrder>
            <LabelOrder>
              {t('Delivery service')}*
              <FieldSelect
                as="select"
                name="deliveryService"
                onChange={e => setFieldValue('deliveryService', e.target.value)}
                value={values.deliveryService}
              >
                <option value="">
                  --- {t('Select delivery services')} ---
                </option>
                <option value="NovaPost">{t('NovaPost')}</option>
                <option value="UkrPost">{t('UkrPost')}</option>
                <option value="Meest">Meest</option>
              </FieldSelect>
            </LabelOrder>
            <LabelOrder>
              {t('Delivery type')}*
              <FieldSelect
                as="select"
                name="deliveryType"
                onChange={e => setFieldValue('deliveryType', e.target.value)}
                value={values.deliveryType}
              >
                <option value="">--- {t('Select branch type')} ---</option>
                <option value="postOffice">{t('postOffice')}</option>
                <option value="section">{t('section')}</option>
              </FieldSelect>
            </LabelOrder>
            <LabelOrder>
              {t('city')}*
              <FieldOrder
                name="city"
                value={values.city}
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=""
              />
              {errors.city && touched.city && (
                <ErrorMessage>{t(errors.city)}</ErrorMessage>
              )}
            </LabelOrder>
            <LabelOrder>
              {t('address')}*
              <FieldOrder
                name="address"
                value={values.address}
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Sanocka 10/48"
              />
              {errors.address && touched.address && (
                <ErrorMessage>{t(errors.address)}</ErrorMessage>
              )}
            </LabelOrder>
            <TextDescription>*{t('Text required')}</TextDescription>
            <button type="submit">Submit</button>
          </StyledForm>
        )}
      </Formik>
    </>
  );
};

export default FormOrder;
