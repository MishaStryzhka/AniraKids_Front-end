import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

export const Title = styled.h2`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  margin-bottom: 16px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const WrapperPhotos = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    margin-top: 5px;
    width: 12px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.color.mainColor2};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.color.additionalColorGray};
    border-radius: 10px;
  }
`;

export const WrapPhoto = styled.label`
  flex: 0 0 auto;
  overflow: hidden;

  width: 200px;
  height: 230px;
  border: 1px dashed;
  border-color: ${({ theme }) => theme.color.lightBGColor};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PhotoImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Picture = styled.picture`
  width: 100px;
  height: 96px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
`;

export const TextPhoto = styled.p`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor2};
`;

export const TextInstruction = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 10px;
  font-weight: 300;
  line-height: 1.8;
  letter-spacing: 0.01px;
  margin-top: 8px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const LabelDescription = styled.label`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  margin-bottom: 16px;
  display: flex;
  gap: 6px;
  flex-direction: column;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const Field = styled.input`
  width: 100%;
  padding: 16px;
  border-radius: 5px;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  border: 1.5px solid;
  outline: transparent;

  color: ${({ theme }) => theme.color.mainColor3};
  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const FieldComments = styled.textarea`
  width: 100%;
  padding: 16px;
  border-radius: 5px;
  border: 1.5px solid;
  outline: transparent;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor3};

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const GeneralList = styled.ul`
  display: flex;
  gap: 8px;
`;

export const Button = styled.button`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  padding: 16px;
  background-color: transparent;
  border: 1px ${({ $active }) => ($active ? 'solid' : 'dashed')};
  border-radius: 2px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor2};
  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const List = styled.ul`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

export const ListHorizont = styled(List)`
  flex-direction: row;
  gap: 16px;
`;
export const ButtonSize = styled.button`
  background-color: transparent;
  padding: 2px 8px;
  border-radius: 2px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const WrapCategory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: ${({ $isCategoryMan }) => ($isCategoryMan ? '48px' : '0')};
`;
export const Label = styled.label`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  display: flex;
  gap: 4px;
  align-items: center;

  color: ${({ theme }) => theme.color.mainColor5};
  cursor: pointer;
`;

export const Input = styled.input`
  display: none;
`;

export const Description = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const BoxCategory = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 48px;
`;

export const Wrap = styled.div`
  margin-top: 48px;
`;

export const ButtonVariant = styled.button`
  width: 200px;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

export const ListColor = styled.ul`
  width: 700px;
  display: flex;
  flex-wrap: wrap;
  column-count: 3;
  gap: 8px;
`;
export const ItemButton = styled.li``;

export const LabelSize = styled.label`
  border: 1px solid;
  border-radius: 2px;
  display: flex;
  cursor: pointer;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const LabelChildren = styled(LabelSize)`
  width: 150px;
  display: block;
`;

export const BoxSize = styled.div`
  text-align: center;
  padding: 2px 8px;
  background-color: ${({ $check, theme }) =>
    $check ? theme.color.additionalColorBrown : 'transparent'};
`;

export const LabelColor = styled.label`
  border: none;
  background-color: transparent;
  width: 200px;
  cursor: pointer;
`;

export const WrapBoxColor = styled.div`
  background-color: ${({ $check, theme }) =>
    $check ? theme.color.additionalColorBrown : 'transparent'};
  display: flex;
  align-items: center;
  gap: 8px;
  width: inherit;
  border-radius: 2px;
  padding: 3px;
`;

export const BoxColor = styled.div`
  width: 18px;
  height: 18px;
  cursor: pointer;
  background-color: ${({ color }) => color};
  border-radius: 2px;
`;

export const WrapChildrenParams = styled.ul`
  display: flex;
  flex-wrap: wrap;
  max-width: 660px;
  gap: 16px;
  column-count: 4;
  margin-bottom: 48px;
`;

export const WrapChildrenSize = styled(WrapChildrenParams)`
  margin-bottom: 0px;
`;

export const GeneralWrap = styled.div`
  display: flex;
  gap: 78px;
`;

export const WrapCondition = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const LabelStatus = styled.label`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const LabelPrice = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
`;

export const InputPrice = styled.input`
  width: 305px;
  padding: 16px;
  border: 1px solid;
  border-radius: 2px;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  outline: none;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
  color: ${({ theme }) => theme.color.mainColor3};
`;

export const Box = styled.div`
  width: 24px;
  height: 24px;
  border: 1px solid;
  display: inline-block;
  border-radius: 2px;
  background-color: transparent;
  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const ButtonSubmit = styled.button`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;

  cursor: pointer;
  width: 305px;
  background-color: transparent;
  border: 1px solid;

  color: ${({ theme }) => theme.color.mainColor3};
  border-color: ${({ theme }) => theme.color.mainColor3};
`;

export const WrapError = styled.div`
  margin-top: 10px;
`;