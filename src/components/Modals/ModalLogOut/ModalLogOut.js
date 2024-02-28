import Button from 'components/Button/Button';
import {
  ButtonBack,
  ModalTitle,
  ModalWindow,
  Wrap,
} from './ModalLogOut.styled';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../redux/auth/operations';
import { useTranslation } from 'react-i18next';

const ModalLogOut = ({ onClick }) => {
  const dispatch = useDispatch();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalLogOut',
  });

  const handleSignOut = () => {
    dispatch(logOut());
  };

  return (
    <ModalWindow>
      <ModalTitle>{t('LogOut')}</ModalTitle>

      <Wrap>
        <Button type="button" onClick={() => handleSignOut()}>
          {t('yes')}
        </Button>
        <ButtonBack
          type="button"
          onClick={() => {
            onClick();
          }}
        >
          {t('back')}
        </ButtonBack>
      </Wrap>
    </ModalWindow>
  );
};

export default ModalLogOut;
