import styled from 'styled-components';

export const Section = styled.section`
  padding: 64px 0;
  @media screen and (min-width: 768px) {
    padding: 72px 0;
  }
  @media screen and (min-width: 1280px) {
    padding: 96px 0;
  }
`;

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 8vw;
  }
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const List = styled.ul`
  @media screen and (max-width: 427.5px) {
    gap: 5vw;
  }
  display: flex;
  gap: 20px;
  margin-bottom: 48px;
`;

export const Item = styled.li`
  @media screen and (max-width: 427.5px) {
    width: 56vw;
  }
  display: flex;
  flex-direction: column;
  align-items: center;

  /* flex-basis: calc((100% - 80px) / 5); */
  width: 100%;
`;

export const WrapIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AddWrap = styled.div`
  margin: 12px 0;
`;

export const TitleDescription = styled.h3`
  @media screen and (max-width: 427.5px) {
    font-size: 3.7vw;
  }
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  margin: 16px 0 8px 0;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Description = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.5vw;
  }
  max-width: 240px;
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const WrapButton = styled.div`
  width: 305px;
  margin: 0 auto;
`;

export const PaginationContainer = styled.div`
  width: 150px;
  height: 20px;
  border: 1px solid black;
  background-color: brown;
  /* Стилі для контейнера точок пагінації */
  .swiper-pagination-bullet {
    width: 50px;
    height: 20px;
    background-color: brown;
  }
`;
