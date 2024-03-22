import styled from 'styled-components';

export const StyledSelectedFiltrs = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

export const SelectedFiltr = styled.div`
  @media screen and (max-width: 427.5px) {
    font-size: ${({ $productPage }) => ($productPage ? '14px' : '3.3vw')};
    padding: ${({ $productPage }) => ($productPage ? '8px 14px' : '1vw 1.8vw')};
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  width: max-content;
  padding: 4px 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 50px;

  @media screen and (min-width: 768px) {
    padding: 4px 10px;
  }
  background-color: ${({ theme }) => theme.color.lightBGColor};

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const CloseButton = styled.button`
  padding: 0;
  cursor: pointer;
  background-color: transparent;
  border: none;

  display: flex;
`;
