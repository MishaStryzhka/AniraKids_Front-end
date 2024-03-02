import styled from 'styled-components';

export const StyledButtonAdd = styled.button`
  box-sizing: border-box;
  width: 305px;
  padding: 14px 40px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.color.mainColor3};

  color: ${({ theme }) => theme.color.mainColor3};
  text-align: center;

  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 142.857% */

  text-decoration: none;
`;
