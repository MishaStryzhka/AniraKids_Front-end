import { useLocation, useParams } from 'react-router-dom';
import { StyledIconStar, StyledIconStarOutline } from './RatingStars.styled';

const RatingStars = ({ rating }) => {
  const stars = [];
  const { id } = useParams();
  const { pathname } = useLocation();
  console.log(pathname);
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(
        <StyledIconStar
          $pageMyOrder={pathname === `/my-account/my-orders/order/${id}`}
          $pageMyPurchase={
            pathname === `/my-account/my-purchases/purchase/${id}`
          }
          key={i}
        />
      );
    } else {
      stars.push(<StyledIconStarOutline key={i} />);
    }
  }
  return stars;
};

export default RatingStars;
