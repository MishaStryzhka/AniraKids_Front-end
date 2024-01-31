import { ModalDescription, ModalTitle, ModalWindow } from '../Modal.styled';
import { StyledIconCross } from '../ModalLogOut/ModalLogOut.styled';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'hooks';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { clearDone } from '../../../redux/auth/slice';
import FormBillingDetails from 'components/Forms/FormBillingDetails/FormBillingDetails';
import FormBankAccount from 'components/Forms/FormBankAccount/FormBankAccount';

const ModalBecomeLandlord = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalBecomeLandlord',
  });

  const [step, setStep] = useState('first');
  const { isDone } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    isDone && setStep('second');
    isDone &&
      setTimeout(() => {
        dispatch(clearDone());
      }, 0);
  }, [dispatch, isDone]);

  return (
    <ModalWindow width="448px">
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      {step === 'first' && (
        <>
          <ModalTitle>{t('becomeLandlord')}</ModalTitle>
          <ModalDescription>{t('fillBillingDetails')}</ModalDescription>
          <FormBillingDetails />
        </>
      )}
      {step === 'second' && (
        <>
          <ModalTitle>Nový bankovní účet</ModalTitle>
          <FormBankAccount />
        </>
      )}
    </ModalWindow>
  );
};

export default ModalBecomeLandlord;
