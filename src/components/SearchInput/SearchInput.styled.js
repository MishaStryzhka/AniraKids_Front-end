import styled from 'styled-components';

export const Input = styled.input`
  padding: 8px 16px;
  width: 100%;
  overflow: hidden;
  border-radius: 50px;
  position: relative;
  background-color: transparent;

  border: 1px solid;
  border-color: ${({ theme }) => theme.color.mainColor2};
  color: ${({ theme }) => theme.color.mainColor2};

  &::placeholder {
    font-family: 'Open Sans Hebrew', sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.43;
    position: absolute;
    left: 36px;

    color: ${({ theme }) => theme.color.lightBGColor};
  }
`;

export const Label = styled.label`
  display: none;
  @media screen and (min-width: 1280px) {
    position: relative;
    width: 305px;
    display: flex;
    align-items: center;
  }
`;

export const WrapIcon = styled.div`
  position: absolute;
  top: 6px;
  left: 8px;
`;
