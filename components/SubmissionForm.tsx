import React, { useState } from 'react';
import QrScanner from './QrScanner';
import { submitToGoogleScript } from '../services/googleAppsScriptService';

interface SubmissionFormProps {
  onBack: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onBack }) => {
  const [referenceId, setReferenceId] = useState('');
  const [machineIds, setMachineIds] = useState<string[]>(['']);
  const [isScanning, setIsScanning] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const updateMachineId = (index: number, value: string) => {
    const newIds = [...machineIds];
    newIds[index] = value;
    setMachineIds(newIds);
  };

  const addMachineIdField = () => {
    setMachineIds([...machineIds, '']);
  };

  const removeMachineIdField = (index: number) => {
    if (machineIds.length > 1) {
      const newIds = machineIds.filter((_, i) => i !== index);
      setMachineIds(newIds);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    if (isScanning !== null) {
      updateMachineId(isScanning, decodedText);
      setIsScanning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const filteredMachineIds = machineIds.filter(id => id.trim() !== '');
    if (filteredMachineIds.length === 0) {
      setStatus('error');
      setMessage('Please enter at least one Machine ID.');
      return;
    }

    try {
      const response = await submitToGoogleScript({ 
        formType: 'machineIdSubmission', 
        referenceId, 
        machineIds: filteredMachineIds 
      });

      if (response.success) {
        setStatus('success');
        setMessage('Machine IDs submitted successfully!');
        setReferenceId('');
        setMachineIds(['']);
      } else {
        throw new Error(response.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`Submission failed: ${error.message}`);
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      {isScanning !== null && (
        <QrScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setIsScanning(null)}
        />
      )}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Submit Machine IDs</h2>
      <p className="text-gray-600 mb-6">Enter your Reference ID and the Machine IDs for your devices.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="referenceId" className="block text-sm font-medium text-gray-700 mb-1">Reference ID</label>
          <input
            type="text"
            name="referenceId"
            id="referenceId"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="Enter the ID provided by the admin"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Machine IDs</label>
          <div className="space-y-3">
            {machineIds.map((id, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={id}
                  onChange={(e) => updateMachineId(index, e.target.value)}
                  placeholder={`Machine ID #${index + 1}`}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="button" onClick={() => setIsScanning(index)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M20 12h-1m-1.636 6.364l-.707-.707M12 20v-1m-6.364-1.636l.707-.707M4 12h1m1.636-6.364l.707.707M5 12h14M5 12a7 7 0 0114 0" /></svg>
                </button>
                {machineIds.length > 1 && (
                  <button type="button" onClick={() => removeMachineIdField(index)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMachineIdField}
            className="mt-3 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Add another ID
          </button>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Submit IDs'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full inline-flex justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </button>
        </div>
        
        {message && (
          <div className={`mt-4 p-4 rounded-md text-sm ${
            status === 'success' ? 'bg-green-100 text-green-800' : 
            status === 'error' ? 'bg-red-100 text-red-800' : ''
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default SubmissionForm;
