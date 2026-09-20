import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';

const Copy = styled.p`
  max-inline-size: 680px;
  margin: 0;
  color: ${t.color.text.secondary};
  font-family: ${t.font.family.ui};
  font-size: ${t.type.bodyMd.size};
  line-height: ${t.type.bodyMd.lineHeight};
`;

function Placeholder({ children }: { children: string }) { return <Copy>{children}</Copy>; }

export function AdminHomePage() { return <Placeholder>Základ administrace je připraven. Obsah přehledu bude doplněn v další fázi.</Placeholder>; }
export function AdminProductsPlaceholder() { return <Placeholder>Správa produktů bude implementována v ADMIN-FE-02.</Placeholder>; }
export function AdminProductCreatePlaceholder() { return <Placeholder>Vytvoření produktu bude implementováno v další fázi.</Placeholder>; }
export function AdminProductDetailPlaceholder() { return <Placeholder>Detail produktu bude implementován v další fázi.</Placeholder>; }
export function AdminReservationsPlaceholder() { return <Placeholder>Správa rezervací bude implementována v další fázi.</Placeholder>; }
export function AdminReservationDetailPlaceholder() { return <Placeholder>Detail rezervace bude implementován v další fázi.</Placeholder>; }
export function AdminCalendarPlaceholder() { return <Placeholder>Kalendář rezervací bude implementován v další fázi.</Placeholder>; }