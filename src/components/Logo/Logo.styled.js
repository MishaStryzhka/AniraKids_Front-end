import IconLogo from 'images/icons/Icon';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledNavLink = styled(NavLink)`
  height: 40px;
  @media screen and (min-width: 1280px) {
    ${({ $isHeader }) => $isHeader && 'margin: 0 160px;'}
    height: 80px;
  }

  width: 70px;
  height: 40px;
  position: relative;
  perspective: 1000px; /* Додає перспективу для 3D ефекту */

  @media screen and (min-width: 1280px) {
    width: 140px;
    height: 80px;
  }

  .text {
    display: inline-block;
    transform-origin: center;
    transition: transform 0.5s ease-in-out;
    animation: rotateText 5s infinite;

    & > g > .letter {
      &.first {
        transform-origin: 37px;
      }
      &.second {
        transform-origin: 102px;
      }
      &.third {
        transform-origin: 149px;
      }
      &.fourth {
        transform-origin: 190px;
      }
      &.fifth {
        transform-origin: 243px;
      }
      &.sixth {
        transform-origin: 299px;
      }

      display: inline-block;
      transition: transform 0.5s ease-in-out;
      animation: rotateText 5s infinite;
    }
  }

  @keyframes rotateText {
    0% {
      transform: rotateY(0deg);
    }
    50% {
      transform: rotateY(180deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
`;

export const StyledIconLogo = styled(IconLogo)`
  width: 70px;
  height: 40px;
  @media screen and (min-width: 1280px) {
    width: 140px;
    height: 80px;
  }
`;
