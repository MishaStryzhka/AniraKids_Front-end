import Button from 'components/Button/Button';
import { Form } from 'formik';
import IconPencil from 'images/icons/IconPencil';
import styled from 'styled-components';

export const ProfileForm = styled(Form)`
  display: flex;
  flex-direction: column-reverse;
  gap: 40px;
  justify-content: space-evenly;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    gap: 0;
  }
`;

export const Wrap = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 93.5vw;
  }
  width: 400px;

  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SecondWrap = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 32px;
  @media screen and (min-width: 768px) {
    gap: 40px;
  }
  @media screen and (min-width: 1280) {
    gap: 64px;
  }
`;

export const AvatarLabel = styled.div`
  width: 197px;
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: center;
`;
export const AvatarWrap = styled.label`
  cursor: pointer;
  overflow: hidden;
  border-radius: 100%;
`;
export const Avatar = styled.img``;
export const AvaterTitle = styled.p``;
export const AvatarDescription = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  text-align: center;
  font-size: 10px;
  line-height: 1.8;
  letter-spacing: 0.01px;
`;

export const Label = styled.label`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
export const Placeholder = styled.p`
  color: ${({ theme }) => theme.color.mainColor5};
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;
`;

export const Wrapper = styled.div`
  display: flex;
  padding: 8px 0;
  gap: 8px;
`;

export const InputText = styled.p`
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
`;

export const ButtonEdit = styled.button`
  padding: 0;
  background-color: transparent;
  border: none;
  width: 24px;
  height: 24px;
  display: flex;
  cursor: pointer;
`;

export const ButtonShow = styled.button`
  padding: 0;
  background-color: transparent;
  border: none;

  display: flex;

  position: absolute;
  right: 8px;
  bottom: 8px;
`;

export const StyledButton = styled(Button)`
  margin: 0 auto;
`;

export const ButtonVerify = styled.button`
  cursor: pointer;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  text-transform: uppercase;
  border: 1px solid;

  color: ${({ theme }) => theme.color.mainColor5};
  border-color: ${({ theme }) => theme.color.mainColor3};
  background-color: transparent;

  &:hover {
    color: ${({ theme }) => theme.color.mainColor3};
  }
  &:active {
    background-color: ${({ theme }) => theme.color.mainColor3};
  }
`;

export const WrapperBiling = styled.div`
  padding: 8px;
  border-bottom: 1px solid;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const StyledIconPencil = styled(IconPencil)`
  width: 20px;
  height: 20px;
  stroke: ${({ theme }) => theme.color.mainColor5};
`;
