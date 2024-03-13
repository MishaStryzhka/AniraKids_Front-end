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
  return (
    <SceletonCard>
      <GeneralWrap>
        <SceletonPictureCard></SceletonPictureCard>
        <WrapText>
          <FirstWrap>
            <SceletonTextName />
            <SceletonTextName />
          </FirstWrap>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <SecondWrap>
              <SceletonPrice></SceletonPrice>
              <div>
                <SceletonTextPrice />
              </div>
            </SecondWrap>
            <SecondWrap>
              <SceletonPrice></SceletonPrice>
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
