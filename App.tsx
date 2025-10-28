
import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import RegistrationForm from './components/RegistrationForm';
import SubmissionForm from './components/SubmissionForm';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case View.Register:
        return <RegistrationForm onBack={() => navigateTo(View.Home)} />;
      case View.Submit:
        return <SubmissionForm onBack={() => navigateTo(View.Home)} />;
      case View.Home:
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="https://www.qtpi.in/assets/logo.png" style={{height: '50px'}}/>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight"> QtBlocks License Form</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm mt-8">
        <p>&copy; {new Date().getFullYear()} Smart License System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
