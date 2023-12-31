import Button from 'components/Button/Button';
import { Form } from 'formik';
import styled from 'styled-components';

export const ProfileForm = styled(Form)`
  display: flex;
  justify-content: space-evenly;
`;

export const Wrap = styled.div`
  width: 400px;

  display: flex;
  flex-direction: column;
  gap: 24px;
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
export const AvatarDescription = styled.p``;

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
  line-height: 20px; /* 142.857% */
`;

export const Wrapper = styled.div`
  display: flex;
  padding: 8px 0;
  gap: 8px;
  align-items: center;
`;

export const InputText = styled.p`
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
`;

export const ButtonEdit = styled.button`
  padding: 0;
  background-color: transparent;
  border: none;

  display: flex;
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
