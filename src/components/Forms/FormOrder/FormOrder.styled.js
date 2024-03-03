import styled from 'styled-components';
import { Form, Field } from 'formik';

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
export const FieldOrder = styled(Field)`
  width: 370px;
  padding: 8px;
  border-radius: 2px;
  outline: none;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  border: 1px solid;

  color: ${({ theme }) => theme.color.additionalColorBrown};
  border-color: ${({ theme }) => theme.color.mainColor2};
`;

export const FieldSelect = styled(FieldOrder)`
  color: ${({ theme }) => theme.color.mainColor5};
  min-width: 370px;
`;
export const TextDescription = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  line-height: 1.43;
  font-size: 14px;

  color: ${({ theme }) => theme.color.mainColor};
`;
