import {
  ButtonAgree,
  ButtonReject,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalRemoveProduct.styled';

const ModalRemoveProduct = ({ onClick }) => {
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <ModalTitle>Дійсно видалити товар?</ModalTitle>
      <ButtonAgree>Так</ButtonAgree>
      <ButtonReject
        onClick={() => {
          onClick();
        }}
      >
        Ні
      </ButtonReject>
    </ModalWindow>
  );
};

export default ModalRemoveProduct;
