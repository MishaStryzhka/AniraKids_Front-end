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
import RatingStars from 'components/RatingStars/RatingStars';
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
        {/* <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 8,
          }}
        >
          {pathname !== '/my-account/rent-out' && (
            <ButtonAddToFavorites
              disabled={isLoading}
              onClick={e => {
                e.preventDefault();
                handleAddToFavorites(product?._id);
              }}
            >
              {pathname === '/my-account/favorite' ? (
                <IconCross />
              ) : (
                <IconLittleHeart
                  fill={
                    favorites?.includes(product?._id) ? '#fff' : 'transparent'
                  }
                  stroke={theme[currentTheme].color.mainColor1}
                />
              )}
            </ButtonAddToFavorites>
          )}
          {pathname === '/my-account/rent-out' && (
            <ButtonAddToFavorites
              type="button"
              onClick={e => {
                e.preventDefault();
                handleUpdate(product._id);
              }}
            >
              <IconPencil />
            </ButtonAddToFavorites>
          )}
          {pathname === '/my-account/rent-out' && (
            <ButtonAddToFavorites
              type="button"
              onClick={e => {
                e.preventDefault();
                handleRemove(product._id);
              }}
            >
              <IconBasket />
            </ButtonAddToFavorites>
          )}
        </div> */}

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
