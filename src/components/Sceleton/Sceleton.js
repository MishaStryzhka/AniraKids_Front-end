import { StyledSceleton } from './Sceleton.styled';

const Sceleton = ({ width, height, borderRadius, className }) => {
  return (
    <StyledSceleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      className={className}
    />
  );
};

export default Sceleton;
