import IconBag from '../../images/icons/IconBag';
import IconHeart from '../../images/icons/IconHeart';
import IconPerson from '../../images/icons/IconPerson';
import { Box } from './BoxNavigation.styled';

const BoxNavigation = ({ $mainPage }) => {
  return (
    <Box>
      <IconHeart fill={'none'} stroke={$mainPage ? '#fff' : '#000'} />
      <IconPerson />
      <IconBag />
    </Box>
  );
};
export default BoxNavigation;
