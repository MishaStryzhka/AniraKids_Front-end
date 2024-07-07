import { StyledContainer } from './Container.styled';

export const Container = ({ className, children, style }) => {
  return (
    <StyledContainer className={className} style={style}>
      {children}
    </StyledContainer>
  );
};
