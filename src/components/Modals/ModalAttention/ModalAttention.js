import Button from 'components/Button/Button';
import {
  ModalTitle,
  ModalWindow,
  StyledIconCrossToWindow,
  TextDescription,
} from '../Modal.styled';
import { useTranslation } from 'react-i18next';

const ModalAttention = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalAttention',
  });
  return (
    <ModalWindow>
      <StyledIconCrossToWindow
        onClick={() => {
          onClick();
        }}
      />
      <ModalTitle>{t('Attention')}</ModalTitle>
      <TextDescription>{t('Description about the photo')}</TextDescription>
      <Button type="submit">{t('saveButton')}</Button>
    </ModalWindow>
  );
};
export default ModalAttention;
