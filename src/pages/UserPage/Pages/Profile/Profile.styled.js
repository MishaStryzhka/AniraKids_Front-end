import { Form } from 'formik';
import styled from 'styled-components';

export const ProfileForm = styled(Form)`
  display: flex;
  justify-content: space-evenly;
`;

export const Wrap = styled.div`
  width: 400px;
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
