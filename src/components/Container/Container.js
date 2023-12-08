import { StyledContainer } from './Container.styled';

export const Container = ({ className, children }) => {
  return <StyledContainer className={className}>{children}</StyledContainer>;
};
