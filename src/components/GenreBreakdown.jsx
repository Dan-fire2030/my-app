import styled from "styled-components";

const Container = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
`;

const GenreList = styled.div`
  display: grid;
  gap: 16px;
`;

const GenreItem = styled.div`
  position: relative;
`;

const GenreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const GenreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GenreIcon = styled.span`
  font-size: 20px;
`;

const GenreName = styled.span`
  font-weight: 500;
  color: #374151;
`;

const GenreStats = styled.div`
  text-align: right;
`;

const GenreAmount = styled.div`
  font-weight: 600;
  color: #1f2937;
`;

const GenrePercentage = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const ProgressBar = styled.div`
  position: relative;
  width: 100%;
  height: 12px;
  background-color: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: ${props => props.color};
  width: ${props => props.percentage}%;
  transition: width 0.7s ease-out;
  border-radius: 6px;
`;

const TotalSection = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-weight: 600;
  color: #374151;
`;

const TotalAmount = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
`;

const GenreBreakdown = ({ genreData }) => {
  const genreConfig = {
    食費: { color: "#f97316", icon: "🍽️" },
    交通費: { color: "#3b82f6", icon: "🚃" },
    娯楽費: { color: "#8b5cf6", icon: "🎮" },
    その他: { color: "#6b7280", icon: "📦" },
  };

  const totalAmount = genreData.reduce((sum, item) => sum + item.amount, 0);

  if (genreData.length === 0) {
    return null;
  }

  return (
    <Container>
      <Title>カテゴリー別支出</Title>
      
      <GenreList>
        {genreData.map(({ genre, percentage, amount }) => {
          const config = genreConfig[genre] || genreConfig["その他"];
          return (
            <GenreItem key={genre}>
              <GenreHeader>
                <GenreInfo>
                  <GenreIcon>{config.icon}</GenreIcon>
                  <GenreName>{genre}</GenreName>
                </GenreInfo>
                <GenreStats>
                  <GenreAmount>¥{amount.toLocaleString()}</GenreAmount>
                  <GenrePercentage>{percentage.toFixed(1)}%</GenrePercentage>
                </GenreStats>
              </GenreHeader>
              
              <ProgressBar>
                <ProgressFill 
                  percentage={percentage}
                  color={config.color}
                />
              </ProgressBar>
            </GenreItem>
          );
        })}
      </GenreList>

      <TotalSection>
        <TotalLabel>合計支出</TotalLabel>
        <TotalAmount>¥{totalAmount.toLocaleString()}</TotalAmount>
      </TotalSection>
    </Container>
  );
};

export default GenreBreakdown;