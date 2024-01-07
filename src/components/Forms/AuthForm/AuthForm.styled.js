import { Field } from 'formik';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const Form = styled.form`
  /* width: 400px; */

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;
export const Description = styled.p`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;
export const Label = styled.label`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  position: relative;

  color: ${({ theme }) => theme.color.mainColor5};

  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const FieldStyled = styled(Field)`
  border-radius: 2px;
  border: 1px solid;
  padding: 8px;
  outline: none;

  border-color: ${({ theme }) => theme.color.mainColor2};

  &::placeholder {
    font-family: 'Open Sans Hebrew', sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.43;

    color: ${({ theme }) => theme.color.lightBGColor};
  }
`;
export const Wrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export const TitleLogin = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  border: transparent;
  border-bottom: 2px solid #000;
  background-color: transparent;
  padding: 8px 0;
  width: 400px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Button = styled.button`
  padding: 14px 40px;
  width: 304px;
  border: none;
  border-radius: 2px;
  cursor: pointer;

  text-align: center;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor1};
  background-color: ${({ theme }) => theme.color.btnColorBG};
`;

export const StyledNavLink = styled(NavLink)`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  border-bottom: 1px solid;
  text-decoration: none;
  width: 200px;
  text-align: center;

  color: ${({ theme }) => theme.color.btnColorBG};
  border-color: ${({ theme }) => theme.color.btnColorBG};
`;

export const WrapIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 25px;
`;
