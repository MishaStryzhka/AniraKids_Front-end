import styled from 'styled-components';

export const ListOrders = styled.ul`
  margin-top: 64px;
`;

export const CartTitle = styled.h1`
  color: ${({ theme }) => theme.color.mainColor5};

  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px; /* 140% */
  letter-spacing: 0.02px;

  text-transform: uppercase;
`;
