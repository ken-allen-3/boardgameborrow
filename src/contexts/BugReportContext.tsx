import React, { createContext, useContext, useState } from 'react';
import BugReportModal from '../components/BugReportModal';

interface BugReportContextType {
  reportBug: (error?: Error) => void;
}

const BugReportContext = createContext<BugReportContextType | null>(null);

export function BugReportProvider({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [currentError, setCurrentError] = useState<Error>();

  const reportBug = (error?: Error) => {
    setCurrentError(error);
    setShowModal(true);
  };

  return (
    <BugReportContext.Provider value={{ reportBug }}>
      {children}
      {showModal && (
        <BugReportModal
          onClose={() => setShowModal(false)}
          error={currentError}
        />
      )}
    </BugReportContext.Provider>
  );
}

export function useBugReport() {
  const context = useContext(BugReportContext);
  if (!context) {
    throw new Error('useBugReport must be used within a BugReportProvider');
  }
  return context;
}