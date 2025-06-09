import React, { useState } from 'react';
import styled from 'styled-components';
import { auth, db } from '../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { manualDataCheck, checkFirestoreConnection } from '../utils/manualDataCheck';
import { investigateDataSync, migrateDataToCurrentUser, createTestData } from '../utils/dataSync';

const DebugContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
`;

const DebugButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 9998;
  
  &:hover {
    background: #2563eb;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 20px;
`;

const InfoSection = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const InfoTitle = styled.h3`
  color: #60a5fa;
  margin: 0 0 10px 0;
`;

const InfoItem = styled.div`
  margin: 5px 0;
  
  strong {
    color: #fbbf24;
  }
`;

const ActionButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin: 5px 5px 5px 0;
  font-size: 11px;
  
  &:hover {
    background: #059669;
  }
`;

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [firestoreData, setFirestoreData] = useState<any[]>([]);
  const [investigationResult, setInvestigationResult] = useState<any>(null);

  const refreshDebugInfo = async () => {
    const user = auth.currentUser;
    
    // ユーザー情報
    const userInfo = user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      providerId: user.providerData?.[0]?.providerId,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    } : null;
    
    // Firestoreデータ
    let budgets: any[] = [];
    if (user) {
      try {
        const q = query(
          collection(db, 'budget_book'),
          where('user_id', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        budgets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate?.()?.toISOString() || 'N/A'
        }));
      } catch (error) {
        console.error('Debug: Error fetching Firestore data:', error);
      }
    }
    
    setDebugInfo({
      user: userInfo,
      timestamp: new Date().toISOString(),
      location: window.location.href,
      userAgent: navigator.userAgent,
    });
    
    setFirestoreData(budgets);
  };

  const copyToClipboard = () => {
    const debugText = JSON.stringify({
      debugInfo,
      firestoreData
    }, null, 2);
    
    navigator.clipboard.writeText(debugText).then(() => {
      alert('Debug info copied to clipboard!');
    });
  };

  const clearLocalData = () => {
    if (confirm('This will clear all local data. Are you sure?')) {
      localStorage.clear();
      sessionStorage.clear();
      alert('Local data cleared. Please refresh the page.');
    }
  };

  if (!isOpen) {
    return (
      <DebugButton onClick={() => {
        setIsOpen(true);
        refreshDebugInfo();
      }}>
        🐛 Debug
      </DebugButton>
    );
  }

  return (
    <DebugContainer>
      <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
      
      <InfoSection>
        <InfoTitle>🔐 Authentication</InfoTitle>
        {debugInfo.user ? (
          <>
            <InfoItem><strong>UID:</strong> {debugInfo.user.uid}</InfoItem>
            <InfoItem><strong>Email:</strong> {debugInfo.user.email}</InfoItem>
            <InfoItem><strong>Provider:</strong> {debugInfo.user.providerId}</InfoItem>
            <InfoItem><strong>Last Sign In:</strong> {debugInfo.user.lastSignInTime}</InfoItem>
          </>
        ) : (
          <InfoItem>Not authenticated</InfoItem>
        )}
      </InfoSection>
      
      <InfoSection>
        <InfoTitle>🗄️ Firestore Data</InfoTitle>
        <InfoItem><strong>Documents:</strong> {firestoreData.length}</InfoItem>
        {firestoreData.map((doc, index) => (
          <InfoItem key={doc.id}>
            <strong>Doc {index + 1}:</strong> {doc.id.substring(0, 8)}...
            <br />Amount: ¥{doc.amount?.toLocaleString() || 0}
            <br />Transactions: {doc.transactions?.length || 0}
          </InfoItem>
        ))}
      </InfoSection>
      
      <InfoSection>
        <InfoTitle>📱 Device Info</InfoTitle>
        <InfoItem><strong>Platform:</strong> {navigator.platform}</InfoItem>
        <InfoItem><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</InfoItem>
      </InfoSection>
      
      {investigationResult && (
        <InfoSection>
          <InfoTitle>🔍 Investigation Results</InfoTitle>
          <InfoItem><strong>Total Docs:</strong> {investigationResult.totalDocs}</InfoItem>
          <InfoItem><strong>User Docs:</strong> {investigationResult.userDocuments?.length || 0}</InfoItem>
          <InfoItem><strong>Query Results:</strong> {investigationResult.userQueryResults}</InfoItem>
          
          {investigationResult.allDocuments?.length > 0 && (
            <InfoItem>
              <strong>All User IDs found:</strong>
              {Array.from(new Set(investigationResult.allDocuments.map((doc: any) => doc.user_id))).map((uid: any) => (
                <div key={uid} style={{ marginLeft: '10px', fontSize: '10px' }}>
                  {uid.substring(0, 10)}... 
                  {uid === auth.currentUser?.uid ? ' (YOU)' : ''}
                  {uid !== auth.currentUser?.uid && (
                    <ActionButton 
                      onClick={() => migrateDataToCurrentUser(uid)}
                      style={{ marginLeft: '5px', fontSize: '8px', padding: '2px 5px' }}
                    >
                      Migrate
                    </ActionButton>
                  )}
                </div>
              ))}
            </InfoItem>
          )}
        </InfoSection>
      )}

      <InfoSection>
        <ActionButton onClick={refreshDebugInfo}>🔄 Refresh</ActionButton>
        <ActionButton onClick={copyToClipboard}>📋 Copy Debug Info</ActionButton>
        <ActionButton onClick={manualDataCheck}>🔍 Manual Data Check</ActionButton>
        <ActionButton onClick={async () => {
          const result = await investigateDataSync();
          setInvestigationResult(result);
        }}>🕵️ Deep Investigation</ActionButton>
        <ActionButton onClick={createTestData}>🧪 Create Test Data</ActionButton>
        <ActionButton onClick={checkFirestoreConnection}>🌐 Test Connection</ActionButton>
        <ActionButton onClick={clearLocalData} style={{ background: '#ef4444' }}>
          🗑️ Clear Local Data
        </ActionButton>
      </InfoSection>
    </DebugContainer>
  );
};

export default DebugPanel;