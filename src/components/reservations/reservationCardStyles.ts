import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';

export const ReservationCard = styled.section`
  border: 1px solid ${t.color.border.subtle};
  border-radius: 14px;
  background: ${t.color.bg.surface};
  padding: 20px;
  display: grid;
  gap: 14px;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const ReservationCardRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  > img {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

export const ReservationCardHeader = styled(ReservationCardRow)`
  justify-content: space-between;
  align-items: flex-start;
`;
