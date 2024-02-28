import { useTranslation } from 'react-i18next';
import { ModalWindow, TextDescription } from '../Modal.styled';
import Button from 'components/Button/Button';

const ModalVideoResolved = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalVideoResolved',
  });
  return (
    <ModalWindow>
      <TextDescription>{t('Video sent resorved')}</TextDescription>
      <Button type="submit">{t('backToMainPage')}</Button>
    </ModalWindow>
  );
};

export default ModalVideoResolved;
