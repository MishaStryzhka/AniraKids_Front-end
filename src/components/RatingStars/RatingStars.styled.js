import IconStar from 'images/icons/IconStart';
import styled from 'styled-components';

export const StyledIconStar = styled(IconStar)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.color.mainColor2};
`;

export const StyledIconStarOutline = styled(IconStar)`
  /* width: 12px;
  height: 12px; */
  width: ${({ $pageMyPurchases, $pageMyOrders }) =>
    $pageMyPurchases || $pageMyOrders ? '20px' : '100px'};
  height: ${({ $pageMyPurchases, $pageMyOrders }) =>
    $pageMyPurchases || $pageMyOrders ? '20px' : '100px'};
  stroke: ${({ theme }) => theme.color.mainColor2};
  fill: ${({ theme }) => theme.color.mainColor1};
`;
