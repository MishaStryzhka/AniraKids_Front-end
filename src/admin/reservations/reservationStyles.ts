import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';
export const ReservationPage = styled.div`
  display: grid;
  gap: ${t.space[6]};
  min-inline-size: 0;
`;
export const ReservationCopy = styled.p`
  margin: 0;
  color: ${t.color.text.secondary};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
  overflow-wrap: anywhere;
`;
export const ReservationPanel = styled.section`
  > span {
    justify-self: start;
  }
  display: grid;
  gap: ${t.space[4]};
  min-inline-size: 0;
  padding: ${t.space[4]};
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  background: ${t.color.bg.surface};
  overflow-wrap: anywhere;
`;
export const ReservationHeading = styled.h2`
  margin: 0;
  font: 600 22px/30px ${t.font.family.ui};
  overflow-wrap: anywhere;
`;
export const ReservationBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${t.space[2]};
`;
export const ReservationFacts = styled.dl`
  display: grid;
  gap: ${t.space[3]};
  margin: 0;
  > div {
    min-inline-size: 0;
    display: grid;
    gap: ${t.space[1]};
  }
  dt {
    color: ${t.color.text.secondary};
    font-size: ${t.type.bodySm.size};
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;
export const ReservationError = styled.p`
  margin: 0;
  color: ${t.color.status.danger.strong};
`;
export const ReservationActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${t.space[3]};
  @media (max-width: 767px) {
    > button {
      inline-size: 100%;
    }
  }
`;
