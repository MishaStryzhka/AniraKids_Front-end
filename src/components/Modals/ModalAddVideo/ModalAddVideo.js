import { ModalWindow } from '../Modal.styled';
import { Input, Label, StyledIconSend, Title } from './ModalAddVideo.styled';
import { useTranslation } from 'react-i18next';
import ImgAddVideo from '../../../images/img-add-video-product.jpg';

const ModalAddVideo = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalAddVideo',
  });
  return (
    <ModalWindow>
      <Title>{t('addVideo')}</Title>
      <img src={ImgAddVideo} alt="ImgAddVideo" />
      <Label>
        <Input placeholder={t('Write your message')} />
        <StyledIconSend />
      </Label>
    </ModalWindow>
  );
};

export default ModalAddVideo;
