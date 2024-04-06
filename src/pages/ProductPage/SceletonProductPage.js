import {
  Border,
  GeneralWrap,
  TextWrap,
  Wrap,
  WrapAllImages,
  WrapBtn,
  WrapDescription,
  WrapInformation,
  WrapInside,
  WrapProductCard,
  WrapSecondaryImages,
} from './ProductPage.styled';
import {
  SceletonBtn,
  SceletonCalendar,
  SceletonDescription,
  SceletonIcon,
  SceletonMainImage,
  SceletonNamePrice,
  SceletonSecondImage,
  SceletonTextPrice,
  SceletonTextSeller,
  SceletonTextSize,
  SceletonTextValueSize,
  SceletonTitle,
  SceletonTitleDescription,
  WrapInsidePrice,
  WrapPrice,
} from './SceletonProductPage.styled';

const SceletonProductPage = () => {
  return (
    <>
      <GeneralWrap>
        <WrapProductCard>
          <WrapAllImages>
            <SceletonMainImage />
            <WrapSecondaryImages>
              <SceletonSecondImage />
              <SceletonSecondImage />
              <SceletonSecondImage />
            </WrapSecondaryImages>
          </WrapAllImages>
          <TextWrap>
            <WrapInformation>
              <Wrap>
                <SceletonTitle />
                <WrapInside>
                  <SceletonTextSeller />
                </WrapInside>
              </Wrap>
              <div style={{ display: 'flex', gap: '8px' }}>
                <SceletonTextSize />
                <SceletonTextValueSize />
              </div>
              <WrapPrice>
                <WrapInsidePrice>
                  <SceletonNamePrice />
                  <SceletonTextPrice />
                  <SceletonTextPrice />
                </WrapInsidePrice>
                <WrapInsidePrice>
                  <SceletonNamePrice />
                  <SceletonTextPrice />
                </WrapInsidePrice>
              </WrapPrice>
              <SceletonCalendar />
              <WrapBtn>
                <SceletonBtn />
                <SceletonBtn />
                <SceletonIcon />
                <SceletonIcon />
              </WrapBtn>
            </WrapInformation>
            <WrapDescription>
              <Border />
              <SceletonTitleDescription />
              <SceletonDescription />
              <SceletonTitleDescription />
              <SceletonDescription />
            </WrapDescription>
          </TextWrap>
        </WrapProductCard>
      </GeneralWrap>
    </>
  );
};
export default SceletonProductPage;
