import { styled } from 'styled-components';

export const PreviewBox = styled.div`
  position: relative;

  ${({ width, height }) =>
    width > 300
      ? `width: ${(400 / height) * width}px; height: 400px;`
      : `height: ${(300 / width) * height}px; width: 300px;`}

  margin: auto;
`;

export const PreviewButtonWraper = styled.div`
  display: flex;
  column-gap: 80px;
  justify-content: center;
  align-items: center;
`;
