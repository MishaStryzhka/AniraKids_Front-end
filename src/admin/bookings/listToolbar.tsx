import styled from 'styled-components';
import {IconButton} from '../../design-system/components/IconButton';
import {designTokens as t} from '../../design-system/tokens/designTokens';
export const ListToolbar=styled.div`display:flex;align-items:center;gap:${t.space[2]};flex-wrap:wrap;`;
export const CountButton=styled(IconButton)`position:relative;`;
export const FilterCount=styled.span`position:absolute;inset-block-start:0;inset-inline-end:0;min-width:16px;height:16px;padding:0 3px;display:grid;place-items:center;border-radius:${t.radius.full};background:${t.color.action.primary.bg};color:${t.color.action.primary.fg};font-size:10px;`;
