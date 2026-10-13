import Button from 'components/Button/Button';
import { Form } from 'formik';
import IconPencil from 'images/icons/IconPencil';
import styled from 'styled-components';
import { designTokens as t } from '../../../../design-system/tokens/designTokens';

export const ProfileForm = styled(Form)`
  display: flex;
  flex-direction: column-reverse;
  gap: 24px;
  padding: 0;
  justify-content: space-between;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    gap: 32px;
  }
`;

export const Wrap = styled.div`
  width: 100%;
  max-width: 400px;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SecondWrap = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

export const AvatarLabel = styled.div`
  width: 197px;
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: center;
  p { margin: 0; }
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
  gap: 8px;

  > p { margin: 0; }
  > p:empty { display: none; }
`;
export const Placeholder = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.color.mainColor5};
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

export const EmailDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
`;

export const InputText = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
`;

export const EmailStatus = styled.span`
  padding: 4px 8px;
  border-radius: ${t.radius.full};
  background: ${t.color.status.success.bg};
  color: ${t.color.status.success.strong};
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
`;

export const PasswordLink = styled.a`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  max-width: 100%;
  color: ${t.color.text.brand};
  font-family: ${t.font.family.ui};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  overflow-wrap: anywhere;

  &:visited { color: ${t.color.text.brand}; }
  &:hover { text-decoration-thickness: 2px; }
  &:focus-visible {
    outline: 2px solid ${t.color.focus.ring};
    outline-offset: 4px;
    border-radius: ${t.radius[1]};
  }
`;

export const ButtonEdit = styled.button`
  padding: 0;
  background-color: transparent;
  border: none;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${t.color.text.brand};
  border-radius: ${t.radius[2]};
  cursor: pointer;
  &:hover:not(:disabled) { background: ${t.color.action.ghost.bgHover}; }
  &:disabled { opacity: 0.5; cursor: default; }
  &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
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
  min-height: 44px;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: ${t.radius[1]};
  cursor: pointer;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  text-transform: uppercase;
  border: 1px solid;

  color: ${t.color.text.brand};
  border-color: ${({ theme }) => theme.color.mainColor3};
  background-color: transparent;

  &:hover {
    color: ${({ theme }) => theme.color.mainColor3};
  }
  &:active {
    background-color: ${t.color.action.secondary.bgActive};
  }
  &:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: 2px; }
`;


export const StyledIconPencil = styled(IconPencil)`
  & g { stroke: inherit; }
  width: 20px;
  height: 20px;
  display: block;
  stroke: currentColor;
`;
