import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  gap: 16px;
  width: 348px;
  flex-direction: column;
  align-items: center;
  position: relative;
  @media screen and (min-width: 768px) {
    width: 400px;
    gap: 24px;
  }
`;

export const LabelModal = styled.label`
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
