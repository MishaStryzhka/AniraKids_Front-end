import styled from 'styled-components';

export const StyledCheckBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid;
  border-radius: 2px;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: transparent;
  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;
