import { StyledIconStar, StyledIconStarOutline } from './RatingStars.styled';

const RatingStars = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<StyledIconStar key={i} />);
    } else {
      stars.push(<StyledIconStarOutline key={i} />);
    }
  }
  return stars;
};

export default RatingStars;
