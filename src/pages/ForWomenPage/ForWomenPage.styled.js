import styled from 'styled-components';

export const TitleFilter = styled.h2`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  margin-bottom: 24px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Wrap = styled.div`
  width: inherit;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media screen and (min-width: 1280px) {
    justify-content: flex-end;
    gap: 6px;
  }
`;
