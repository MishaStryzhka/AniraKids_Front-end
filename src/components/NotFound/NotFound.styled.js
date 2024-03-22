import IconBeauty from 'images/icons/IconBeauty';
import styled from 'styled-components';

export const WrapNotFound = styled.div`
  @media screen and (max-width: 427.5px) {
    gap: 5.6vw;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
`;

export const Text = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 4.7vw;
  }
  color: ${({ theme }) => theme.color.btnColorBG};
  text-align: center;

  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px; /* 140% */
  letter-spacing: 0.02px;
`;

export const StyledIconBeauty = styled(IconBeauty)`
  @media screen and (max-width: 427.5px) {
    width: 42.3vw;
    height: 42vw;
  }
`;
