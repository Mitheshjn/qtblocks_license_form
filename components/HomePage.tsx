
import React from 'react';
import { View } from '../types';

interface HomePageProps {
  onNavigate: (view: View) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Welcome</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Please select an option below to register your institution or submit your device IDs for licensing.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-4">
          <button
            onClick={() => onNavigate(View.Register)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            Register School
          </button>
          <button
            onClick={() => onNavigate(View.Submit)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            Submit Machine IDs
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
