import styled from 'styled-components';
import { Form } from 'formik';
import { InputField } from '../Form.styled';

export const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export const LabelOrder = styled.label`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  display: flex;
  flex-direction: column;
  gap: 4px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
export const FieldOrder = styled(InputField)`
  @media screen and (max-width: 427.5px) {
    width: 86vw;
  }
  min-width: 388px;
  @media screen and (min-width: 768px) {
    width: 415px;
  }
`;

export const FieldSelect = styled(FieldOrder)`
  @media screen and (max-width: 427.5px) {
    min-width: 90.5vw;
  }
  min-width: 388px;
  color: ${({ theme }) => theme.color.mainColor5};
  @media screen and (min-width: 768px) {
    width: 415px;
  }
  select {
    padding: 8px;
  }
  option {
    width: inherit;
    border-color: ${({ theme }) => theme.color.mainColor4};
    color: ${({ theme }) => theme.color.mainColor4};
    margin: 8px;
  }
  /* option:focus {
    background-color: ${({ theme }) => theme.color.additionalColorBrown};
  } */
  option:checked {
    background-color: ${({ theme }) => theme.color.mainColor1};
  }
  option:hover {
    background-color: ${({ theme }) => theme.color.additionalColorBrown};
  }
`;

export const TextDescription = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  line-height: 1.43;
  font-size: 14px;

  color: ${({ theme }) => theme.color.mainColor};
`;

export const ModalDeliveryTitle = styled.div`
  background-color: #fff;
  height: 56px;
  padding: 18px 20px;
  box-sizing: border-box;
`;
