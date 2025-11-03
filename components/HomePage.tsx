import React from 'react';
import { View } from '../types';

interface HomePageProps {
  onNavigate: (view: View) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {

  const handleWatchVideoClick = () => {
    // Open the video in a new tab for the most reliable playback experience.
    const videoUrl = 'https://drive.google.com/file/d/1yCnx430puzHgQBuVPJyEzGAOWqRYjLIn/view?usp=sharing';
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-12">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Welcome</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Please watch the instructional video first, then proceed with the registration or machine ID submission.
        </p>
        <div className="mt-6">
            <button
              onClick={handleWatchVideoClick}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Me First
            </button>
        </div>
        <p className="mt-8 text-lg text-gray-600 max-w-3xl mx-auto">
          Please select an option below to register your institution or submit your device IDs for licensing.
        </p>
        <div className="mt-6 max-w-3xl mx-auto space-y-4 text-left">
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                <p className="font-semibold">Important: Schools must register only once. Multiple registrations from the same institution will be considered void.</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
                <p><strong>Please keep your Reference ID safe after registration.</strong> You will need it later to submit your machine IDs.</p>
            </div>
        </div>
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