import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';

export const PreviewBox = styled.div`
  position: relative;
  width: 100%;
  height: clamp(180px, 42vh, 352px);
  overflow: hidden;
  border-radius: ${t.radius[2]};
  background: ${t.color.bg.subtle};
  pointer-events: ${({ $busy }) => $busy ? 'none' : 'auto'};
`;

export const CropHint = styled.p`
  margin: 0 0 16px;
  font: 400 14px/1.5 ${t.font.family.ui};
  color: ${t.color.text.secondary};
`;

export const CropError = styled(CropHint)`
  color: ${t.color.status.danger.fg};
`;

export const ZoomControl = styled.label`
  display: flex;
  flex-direction: column;
  margin: 16px 0;
  font: 500 14px/1.5 ${t.font.family.ui};
  color: ${t.color.text.primary};
  input {
    width: 100%;
    min-height: 44px;
    margin: 0;
    accent-color: ${t.color.action.primary.bg};
    cursor: pointer;
  }
  input:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: 2px; }
`;

export const PreviewButtonWraper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

export const CropButton = styled.button`
  min-width: 0;
  min-height: 48px;
  padding: 12px;
  border: 1px solid ${t.color.action.primary.bg};
  border-radius: ${t.component.button.radius};
  font: 600 15px/20px ${t.font.family.ui};
  cursor: pointer;
  color: ${({ $secondary }) => $secondary ? t.color.text.brand : t.color.text.inverse};
  background: ${({ $secondary }) => $secondary ? t.color.bg.surface : t.color.action.primary.bg};
  &:hover:not(:disabled) { background: ${({ $secondary }) => $secondary ? t.color.bg.subtle : t.color.action.primary.bgHover}; }
  &:disabled { opacity: 0.55; cursor: wait; }
  &:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: 2px; }
`;
