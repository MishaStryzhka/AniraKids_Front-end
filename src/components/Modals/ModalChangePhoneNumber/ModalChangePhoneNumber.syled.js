import styled from 'styled-components';

export const Form = styled.form`
  @media screen and (max-width: 427.5px) {
    width: 81vw;
  }
  display: flex;
  position: relative;
  width: 348px;
  gap: 16px;
  flex-direction: column;
  align-items: center;
  @media screen and (min-width: 768px) {
    width: 400px;
    gap: 24px;
  }
`;

export const Label = styled.label`
  @media screen and (max-width: 427.5px) {
    width: 71vw;
  }
  width: 305px;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  display: flex;
  flex-direction: column;
  @media screen and (min-width: 768px) {
    width: inherit;
  }

  color: ${({ theme }) => theme.color.mainColor5};
`;
