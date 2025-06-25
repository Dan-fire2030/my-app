import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
  padding: 32px;
  max-width: 420px;
  width: 90%;
  margin: 0 16px;
  animation: slideUp 0.3s ease-out;
  border: 2px solid #FFD700;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
`;

const Icon = styled.svg`
  width: 24px;
  height: 24px;
  color: #ef4444;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const Description = styled.p`
  font-size: 14px;
  color: #cccccc;
  text-align: center;
  margin-bottom: 24px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  color: #cccccc;
  font-weight: 600;
  border: 1px solid #666666;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #333333, #2a2a2a);
    border-color: #FFD700;
    color: #FFD700;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 700;
  border: 1px solid #ef4444;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
`;

const ModalDelete = ({ deleteTransactionByIndex, handleCloseClick }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseClick();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <IconContainer>
          <IconWrapper>
            <Icon fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </Icon>
          </IconWrapper>
        </IconContainer>

        <Title>取引を削除しますか？</Title>
        <Description>
          この操作は取り消すことができません
        </Description>

        <ButtonGroup>
          <CancelButton onClick={handleCloseClick}>
            キャンセル
          </CancelButton>
          <DeleteButton
            onClick={() => {
              deleteTransactionByIndex();
              handleCloseClick();
            }}
          >
            削除する
          </DeleteButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default ModalDelete;