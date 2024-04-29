import { useTranslation } from 'react-i18next';
import {
  FieldSelect,
  LabelOrder,
  StyledForm,
  TextDescription,
  FieldOrder,
  ModalDeliveryTitle,
} from './FormOrder.styled';
import { Formik } from 'formik';
import { validationFormOrderScheme } from 'schemas';
import { ErrorMessage } from '../Form.styled';
import { useAuth } from 'hooks';
import Modal from 'components/Modals/Modal';
import { useEffect, useState } from 'react';
import GoogleMap from 'components/GoogleMap/GoogleMap';

const FormOrder = ({ order }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.formOrder',
  });
  const [isOpenModalDeliveryService, setIsOpenModalDeliveryService] =
    useState(false);

  function iframeListener(event) {
    if (event.data.message === 'pickerResult') {
      console.log('event.data', event.data);
      setIsOpenModalDeliveryService(false);
    }
  }

  useEffect(() => {
    isOpenModalDeliveryService &&
      window.addEventListener('message', iframeListener);

    return () => {
      window.addEventListener('message', iframeListener);
    };
  }, [isOpenModalDeliveryService]);

  const { user } = useAuth();

  const handleFormOrderSubmit = (values, { resetForm }) => {
    resetForm();
  };
  return (
    <>
      <Formik
        initialValues={{
          fullName: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.primaryPhoneNumber,
          email: user.email,
          deliveryService:
            order.typeRent === 'photosession' ? 'selfPickup' : '',
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
              {t('Delivery service')}*
              <FieldSelect
                as="select"
                name="deliveryService"
                onChange={e => {
                  handleChange(e);
                  if (
                    e.currentTarget.value === 'Balikovna' ||
                    e.currentTarget.value === 'czechPost'
                  ) {
                    setIsOpenModalDeliveryService(true);
                  }
                }}
                value={values.deliveryService}
                disabled={order.typeRent === 'photosession'}
              >
                <option value="" disabled>
                  --- {t('Select delivery services')} ---
                </option>
                <option value="Balikovna">Balíkovna</option>
                <option value="czechPost">Česka pošta</option>
                <option value="selfPickup">{t('selfPickup')}</option>
                {/* <option value="Zasilkovna">Zasilkovna</option>
                    <option value="PPL">PPL</option>
                    <option value="DHL">DHL</option> */}
              </FieldSelect>
              {errors.deliveryService && touched.deliveryService && (
                <ErrorMessage>{t(errors.deliveryService)}</ErrorMessage>
              )}
            </LabelOrder>

            {values.deliveryService === 'selfPickup' && (
              <>
                <p>{order?.pickupAddress?.formatted_address}</p>
                <GoogleMap
                  style={{ height: 230 }}
                  place={order?.pickupAddress}
                />
              </>
            )}

            {/* {values.deliveryService === 'Balikovna' && (
              <LabelOrder>
                {t('Delivery type')}*
                <FieldSelect
                  as="select"
                  name="deliveryType"
                  onChange={e => {
                    setIsOpenModalDeliveryService(true);
                    setFieldValue('deliveryType', e.target.value);
                  }}
                  value={values.deliveryType}
                >
                  <option value="" disabled>
                    --- {t('Select branch type')} ---
                  </option>
                  <option value="postOffice">{t('postOffice')}</option>
                  <option value="section">{t('section')}</option>
                </FieldSelect>
                {errors.deliveryType && touched.deliveryType && (
                  <ErrorMessage>{t(errors.deliveryType)}</ErrorMessage>
                )}
              </LabelOrder>
            )} */}

            {/* <LabelOrder>
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
            </LabelOrder> */}

            <TextDescription>*{t('Text required')}</TextDescription>

            {isOpenModalDeliveryService && (
              <Modal closeModal={() => setIsOpenModalDeliveryService(false)}>
                <ModalDeliveryTitle>Vyberte Balíkovnu</ModalDeliveryTitle>
                <iframe
                  width={850}
                  height={700}
                  title="Výběr místa pro vyzvednutí zásilky"
                  src={`https://b2c.cpost.cz/locations/?type=${
                    values.deliveryService === 'Balikovna'
                      ? 'BALIKOVNY'
                      : 'POST_OFFICE'
                  }`}
                  allow="geolocation"
                />
              </Modal>
            )}
          </StyledForm>
        )}
      </Formik>
    </>
  );
};

export default FormOrder;
