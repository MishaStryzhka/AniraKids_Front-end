import styled from 'styled-components';

export const StyledButtonViewMore = styled.button`
  @media screen and (max-width: 427.5px) {
    width: ${({ $pageMyOrders, $pageMyPurchases }) =>
      $pageMyOrders || $pageMyPurchases ? '74.8vw' : '72vw'};
    font-size: 4.7vw;
    justify-content: space-between;
    padding: 1.5vw;
  }
  width: ${({ $pageMyOrders, $pageMyPurchases }) =>
    $pageMyOrders || $pageMyPurchases ? '297px' : '287px'};
  cursor: pointer;
  padding: 8px;
  margin-left: 0;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  text-transform: uppercase;
  text-decoration: none;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: none;
  background-color: transparent;

  @media screen and (min-width: 768px) {
    width: ${({ $pageMyOrders, $pageMyPurchases }) =>
      $pageMyOrders || $pageMyPurchases ? '320px' : '287px'};
  }
  @media screen and (min-width: 1280px) {
    float: right;
  }

  color: ${({ theme }) => theme.color.mainColor5};
`;
