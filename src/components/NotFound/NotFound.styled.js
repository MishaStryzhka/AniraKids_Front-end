import styled from 'styled-components';

export const WrapNotFound = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

export const Text = styled.p`
  color: ${({ theme }) => theme.color.btnColorBG};
  text-align: center;

  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px; /* 140% */
  letter-spacing: 0.02px;
`;
