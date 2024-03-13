import styled from 'styled-components';

export const Form = styled.form`
  @media screen and (max-width: 427.5px) {
    width: 71vw;
  }
  display: flex;
  gap: 16px;
  width: 305px;
  flex-direction: column;
  align-items: center;
  position: relative;
  @media screen and (min-width: 768px) {
    width: 400px;
    gap: 24px;
  }
`;

export const LabelModal = styled.label`
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
  position: relative;
  @media screen and (min-width: 768px) {
    width: inherit;
  }

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const WrapIcon = styled.div`
  position: absolute;
  top: 27px;
  right: 10px;
  cursor: pointer;
`;
