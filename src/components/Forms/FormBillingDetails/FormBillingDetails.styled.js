import { Form } from 'formik';
import styled from 'styled-components';

export const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
`;

export const WrapInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ButtonLabel = styled.label`
  cursor: pointer;

  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.43;
  padding: 8px;
  background-color: transparent;
  border: 1px ${({ $active }) => ($active ? 'solid' : 'dashed')};
  border-radius: 2px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor2};
  border-color: ${({ theme, $active }) =>
    $active ? theme.color.mainColor2 : theme.color.additionalColorBrown};
`;
