import { Field } from 'formik';
import styled from 'styled-components';

export const InputField = styled(Field)`
  @media screen and (max-width: 427.5px) {
    width: 90.6vw;
  }
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
  width: 388px;
  @media screen and (min-width: 768px) {
    width: 334px;
  }
  @media screen and (min-width: 1280px) {
    width: 400px;
  }

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

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.color.additionalColorRed};

  font-family: 'Open Sans, sans-serif';
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 142.857% */
`;
