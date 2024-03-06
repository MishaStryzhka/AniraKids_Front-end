import { useLocation } from 'react-router-dom';
import {
  SceletonCard,
  SceletonPictureCard,
  SceletonPictureSeller,
  SceletonPrice,
  SceletonStar,
  SceletonTextName,
  SceletonTextPrice,
  SceletonTextRating,
  SceletonUserNickname,
} from './SceletonUsersProductCard.styled';
const {
  GeneralWrap,
  FirstWrap,
  WrapText,
  SecondWrap,
  WrapPartSeller,
  WrapTextSeller,
  WrapIconsStars,
} = require('./UsersProductCard.styled');

const SceletonUsersProductCard = () => {
  const { pathname } = useLocation();
  return (
    <SceletonCard $pageRentOut={pathname === '/my-account/rent-out'}>
      <GeneralWrap $pageRentOut={pathname === '/my-account/rent-out'}>
        <SceletonPictureCard
          $pageRentOut={pathname === '/my-account/rent-out'}
        ></SceletonPictureCard>
        <WrapText $pageRentOut={pathname === '/my-account/rent-out'}>
          <FirstWrap $pageRentOut={pathname === '/my-account/rent-out'}>
            <SceletonTextName />
            <SceletonTextName />
          </FirstWrap>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <SecondWrap>
              <SceletonPrice
                $pageRentOut={pathname === '/my-account/rent-out'}
              ></SceletonPrice>
              <div>
                <SceletonTextPrice />
              </div>
            </SecondWrap>
            <SecondWrap>
              <SceletonPrice
                $pageRentOut={pathname === '/my-account/rent-out'}
              ></SceletonPrice>
              <div>
                <SceletonTextPrice />
              </div>
            </SecondWrap>
          </div>
          <WrapPartSeller>
            <SceletonPictureSeller />
            <div>
              <WrapTextSeller>
                <WrapIconsStars>
                  <SceletonStar />
                  <SceletonStar />
                  <SceletonStar />
                  <SceletonStar />
                  <SceletonStar />
                </WrapIconsStars>
                <SceletonTextRating />
              </WrapTextSeller>
              <SceletonUserNickname />
            </div>
          </WrapPartSeller>
        </WrapText>
      </GeneralWrap>
    </SceletonCard>
  );
};

export default SceletonUsersProductCard;
