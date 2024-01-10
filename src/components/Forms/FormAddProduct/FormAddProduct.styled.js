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

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const WrapPhoto = styled.div`
  width: 200px;
  height: 230px;
  border: 1px dashed;
  border-color: ${({ theme }) => theme.color.lightBGColor};
  display: flex;
  justify-content: center;
  align-items: center;
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

  color: ${({ theme }) => theme.color.mainColor3};
  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const FieldComments = styled.textarea`
  width: 100%;
  padding: 16px;
  border-radius: 5px;
  border: 1.5px solid;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor3};

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const GeneralList = styled.ul`
  display: flex;
  gap: 20px;
`;

export const Button = styled.button`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  padding: 16px;
  background-color: transparent;
  border: 1px dashed;

  color: ${({ theme }) => theme.color.mainColor2};
  border-color: ${({ theme }) => theme.color.additionalColorBrown};

  :active {
    border: 1px solid;
  }
`;

export const ListSize = styled.ul`
  display: flex;
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
  margin-bottom: ${({ $isParamsMan }) => ($isParamsMan ? '48px' : '0')};

  label {
    font-family: 'Open Sans Hebrew', sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.43;
    display: flex;
    gap: 4px;
    margin-left: 30px;

    color: ${({ theme }) => theme.color.mainColor5};
    cursor: pointer;
    position: relative;
  }

  input {
    display: none;
  }

  label::before {
    content: '';
    width: 24px;
    height: 24px;
    border: 1px solid;
    display: inline-block;
    position: absolute;
    border-radius: 2px;
    left: -30px;
    top: 50%;
    transform: translateY(-50%);
    background-color: transparent;
    border-color: ${({ theme }) => theme.color.additionalColorBrown};
    /* background-image: url("data:image/svg+xml;charset=utf8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_171_7028)'%3E%3Cpath d='M5 12L10 17L20 7' stroke='%2300542C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_171_7028'%3E%3Crect width='24' height='24' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E"); */
  }
`;

export const Input = styled.input`
  display: none;
`;

export const Description = styled.p`
  margin-bottom: 10px;

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
  margin-bottom: 48px;
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
export const ButtonColor = styled.button`
  border: none;
  background-color: transparent;
  width: 200px;
`;

export const ColorBox = styled.div`
  width: 20px;
`;
