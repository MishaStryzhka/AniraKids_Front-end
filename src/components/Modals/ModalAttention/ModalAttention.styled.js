import styled from 'styled-components';
import { ModalWindow, TextDescription } from '../Modal.styled';

export const GeneralModalWindow = styled(ModalWindow)`
  @media screen and (max-width: 427.5px) {
    width: 84vw;
  }
  gap: 24px;
  @media screen and (min-width: 768px) {
    width: 360px;
  }
`;

export const TextDescriptionPhoto = styled(TextDescription)`
  max-width: 300px;
`;
