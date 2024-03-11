import { Field } from 'formik';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const Label = styled.label`
  @media screen and (max-width: 427.5px) {
    font-size: 3.7vw;
  }
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
    @media screen and (max-width: 427.5px) {
      font-size: 3.7vw;
    }
    font-family: 'Open Sans Hebrew', sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.43;

    color: ${({ theme }) => theme.color.lightBGColor};
  }
`;

export const WrapIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 25px;
  cursor: pointer;
`;

export const Button = styled.button`
  @media screen and (max-width: 427.5px) {
    width: 71vw;
    padding: 3.3vw 9.3vw;
  }
  padding: 14px 40px;
  width: 304px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 8px;

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

export const TextCondition = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const StyledNavLinkCondition = styled(NavLink)`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-decoration: none;
  margin-left: 5px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
