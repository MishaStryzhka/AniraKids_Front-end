import CropperWrap from 'components/CropperWrap/CropperWrap';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { designTokens as t } from '../../../design-system/tokens/designTokens';

const AvatarWindow = styled.div`
  box-sizing: border-box;
  width: min(400px, calc(100vw - 32px));
  max-width: 100%;
  padding: 48px 16px 24px;
  @media (min-width: 768px) { padding-inline: 24px; }
`;

const AvatarTitle = styled.h2`
  margin: 0 0 12px;
  font: 500 24px/1.3 ${t.font.family.editorial};
  color: ${t.color.text.primary};
`;

const ModalAddAvatar = ({ avatar, onSave, onClose, onSavingChange }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.modalAddAvatar' });
  return (
    <AvatarWindow role="dialog" aria-modal="true" aria-labelledby="avatar-editor-title">
      <AvatarTitle id="avatar-editor-title">{t('Add profile picture')}</AvatarTitle>
      <CropperWrap image={avatar} onSave={onSave} onClose={onClose} onSavingChange={onSavingChange} />
    </AvatarWindow>
  );
};

export default ModalAddAvatar;
