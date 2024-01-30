import { Field, Formik } from 'formik';
import {
  InputModal,
  LabelModal,
  ModalDescription,
  ModalTitle,
  ModalWindow,
} from '../Modal.styled';
import { StyledIconCross } from '../ModalLogOut/ModalLogOut.styled';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'hooks';
import { useDispatch } from 'react-redux';
import { WrapButton } from '../ModalRegister/ModalRegister.styled';
import { BeatLoader } from 'react-spinners';
import { validModalBecomeLandlordScheme } from 'schemas';
import {
  ButtonLabel,
  StyledForm,
  WrapInput,
} from './ModalBecomeLandlord.styled';
import Button from 'components/Button/Button';
import { ErrorMessage } from 'components/Forms/Form.styled';
import { updateUserBillingDetails } from '../../../redux/auth/operations';
import { useEffect, useState } from 'react';
import { clearDone } from '../../../redux/auth/slice';
import FormBillingDetails from 'components/Forms/FormBillingDetails/FormBillingDetails';

const ModalBecomeLandlord = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalBecomeLandlord',
  });

  const [step, setStep] = useState('first');
  const { user, isLoading, isDone } = useAuth();
  const dispatch = useDispatch();

  console.log('step', step);

  useEffect(() => {
    isDone && setStep('second');
    isDone &&
      setTimeout(() => {
        dispatch(clearDone());
      }, 0);
  }, [dispatch, isDone]);

  const handleSubmit = e => {
    dispatch(updateUserBillingDetails(e));
  };

  return (
    <ModalWindow width="448px">
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <ModalTitle>{t('becomeLandlord')}</ModalTitle>
      <ModalDescription>{t('fillBillingDetails')}</ModalDescription>
      <FormBillingDetails />
    </ModalWindow>
  );
};

export default ModalBecomeLandlord;
