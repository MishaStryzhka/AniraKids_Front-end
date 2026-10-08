// ========
// closeModal for close Modal
//
// prohibitClosingByBackdrop
// ========
import { useEffect, useRef } from 'react';
import {
  Backdrop,
  CloseButton,
  ModalContainer,
  ScrollBox,
  StyledIconCross,
} from './Modal.styled';
import { createPortal } from 'react-dom';

// Preserve the page's previous scroll state, including login-driven unmounts.
let scrollLocks = 0;
let previousOverflowY = '';
const Modal = ({
  children,
  closeModal,
  prohibitClosingByBackdrop = false,
  authModal = false,
}) => {
  const container = useRef(null);
  const close = useRef(closeModal);
  close.current = closeModal;
  useEffect(() => {
    if (scrollLocks++ === 0) {
      previousOverflowY = document.body.style.overflowY;
      document.body.style.overflowY = 'hidden';
    }
    const previousFocus = document.activeElement;
    const handleKeyDown = event => {
      if (event.key === 'Escape' && close.current) {
        event.preventDefault();
        close.current();
      }
      if (authModal && event.key === 'Tab') {
        const elements = [
          ...(container.current?.querySelectorAll(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
          ) ?? []),
        ].filter(element => element.getClientRects().length > 0);
        const first = elements[0],
          last = elements[elements.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !container.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !container.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (authModal) container.current?.querySelector('button')?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (--scrollLocks === 0)
        document.body.style.overflowY = previousOverflowY;
      if (
        authModal &&
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      )
        previousFocus.focus();
    };
  }, [authModal]);
  const handleBackdropClick = event => {
    if (event.currentTarget === event.target && !prohibitClosingByBackdrop)
      close.current?.();
  };

  return createPortal(
    <Backdrop
      data-auth-backdrop={authModal || undefined}
      onClick={
        closeModal && !prohibitClosingByBackdrop
          ? handleBackdropClick
          : () => {}
      }
    >
      <ScrollBox
        $authModal={authModal}
        onClick={
          closeModal && !prohibitClosingByBackdrop
            ? handleBackdropClick
            : () => {}
        }
      >
        <ModalContainer
          ref={container}
          $authModal={authModal}
          role={authModal ? 'dialog' : undefined}
          aria-modal={authModal ? true : undefined}
          aria-label={authModal ? 'Registrace a přihlášení' : undefined}
        >
          {closeModal && (
            <CloseButton
              $authModal={authModal}
              type="button"
              aria-label="Zavřít"
              onClick={closeModal}
            >
              <StyledIconCross />
            </CloseButton>
          )}
          {children}
        </ModalContainer>
      </ScrollBox>
    </Backdrop>,
    document.querySelector('#modal')
  );
};
export default Modal;
