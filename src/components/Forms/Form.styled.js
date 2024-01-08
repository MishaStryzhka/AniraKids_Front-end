import { Field } from 'formik';
import styled from 'styled-components';

export const InputField = styled(Field)`
  width: ${({ width = '100%' }) => width};
  box-sizing: border-box;

  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  border-radius: 2px;
  border: 1px solid;
  padding: 8px;
  outline: none;

  border-color: ${({ theme }) => theme.color.mainColor2};
  color: ${({ theme }) => theme.color.mainColor2};

  // for password, clear buttton 'show'
  //
  &&::-webkit-inner-spin-button,
  &&::-webkit-outer-spin-button,
  &&::-ms-reveal,
  &&::-ms-clear {
    -webkit-appearance: none;
    margin: 0;
    display: none;
  }
`;

export const TextError = styled.p`
  color: #ff0015;
`;
