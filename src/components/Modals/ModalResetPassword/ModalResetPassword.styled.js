import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  gap: 16px;
  width: 400px;
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

export const Description = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  margin-top: 4px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
