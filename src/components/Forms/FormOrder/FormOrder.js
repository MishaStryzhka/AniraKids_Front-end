import { useTranslation } from 'react-i18next';
import {
  FieldSelect,
  LabelOrder,
  StyledForm,
  TextDescription,
  FieldOrder,
} from './FormOrder.styled';
import { Formik } from 'formik';
import { validationFormOrderScheme } from 'schemas';
import { ErrorMessage } from '../Form.styled';
import { useAuth } from 'hooks';
import Modal from 'components/Modals/Modal';
import { useEffect, useState } from 'react';
import { GeneralModalWindow } from 'components/Modals/Modal.styled';

const FormOrder = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formOrder',
  });
  const [isOpenModaldeliveryService, setIsOpenModalDeliveryService] =
    useState(false);

  function iframeListener(event) {
    if (event.data.message === 'pickerResult') {
      console.log('event.data', event.data);
      setIsOpenModalDeliveryService(false);
    }
  }

  useEffect(() => {
    isOpenModaldeliveryService &&
      window.addEventListener('message', iframeListener);

    return () => {
      window.addEventListener('message', iframeListener);
    };
  }, [isOpenModaldeliveryService]);

  const { user } = useAuth();

  const handleFormOrderSubmit = (values, { resetForm }) => {
    console.log(values);
    resetForm();
  };
  return (
    <>
      <Formik
        initialValues={{
          fullName: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.primaryPhoneNumber,
          email: user.email,
          deliveryService: '',
          deliveryType: '',
          city: '',
          address: '',
        }}
        validationSchema={validationFormOrderScheme}
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
          <StyledForm id="orderForm" onSubmit={handleSubmit}>
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
              {errors.deliveryType && touched.deliveryType && (
                <ErrorMessage>{t(errors.deliveryType)}</ErrorMessage>
              )}
            </LabelOrder>

            <LabelOrder>
              {t('Delivery service')}*
              <FieldSelect
                as="select"
                name="deliveryService"
                onChange={e => {
                  setIsOpenModalDeliveryService(true);
                  handleChange(e);
                }}
                value={values.deliveryService}
              >
                <option value="">
                  --- {t('Select delivery services')} ---
                </option>
                <option value="Balíkovna">Balíkovna</option>
                <option value="Zasilkovna">Zasilkovna</option>
                <option value="PPL">PPL</option>
                <option value="DHL">DHL</option>
              </FieldSelect>
              {errors.deliveryService && touched.deliveryService && (
                <ErrorMessage>{t(errors.deliveryService)}</ErrorMessage>
              )}
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
          </StyledForm>
        )}
      </Formik>
      {isOpenModaldeliveryService && (
        <Modal closeModal={() => setIsOpenModalDeliveryService(false)}>
          <GeneralModalWindow>
            <iframe
              width={850}
              height={700}
              title="Výběr místa pro vyzvednutí zásilky"
              src="https://b2c.cpost.cz/locations/?type=BALIKOVNY"
              allow="geolocation"
            />
          </GeneralModalWindow>
        </Modal>
      )}
    </>
  );
};

export default FormOrder;
