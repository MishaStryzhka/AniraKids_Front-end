import IconStar from 'images/icons/IconStart';
import styled, { keyframes } from 'styled-components';

const floatingAnimation = keyframes`
0% {
  background-position: -1000px 0;
}
100% {
  background-position: 1000px 0;
}
`;

const animateFill = keyframes`
0%, 100% {
  fill: #C6A58D; // Початковий колір
}
50% {
  fill: #edeef1; // Проміжний колір
}
`;

export const StyledSceleton = styled.div`
  @media screen and (max-width: 427.5px) {
    width: ${({ width }) => width || '100px'};
  }
  width: inherit;
  height: ${({ height }) => height || '40px'};
  width: ${({ width }) => width || '100px'};
  border-radius: ${({ borderRadius }) => borderRadius || '2px'};

  animation: ${floatingAnimation} 1.5s infinite linear;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 1000px 100%;
`;

export const StyledSceletonStar = styled(IconStar)`
  animation: ${animateFill} 2s infinite; // Застосування анімації до SVG
`;
