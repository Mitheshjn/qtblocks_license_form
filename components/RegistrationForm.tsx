import React, { useState } from 'react';
import { submitToGoogleScript } from '../services/googleAppsScriptService';
import type { RegistrationFormData } from '../types';

interface RegistrationFormProps {
  onBack: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // The backend script expects the full data URI string (e.g., "data:image/png;base64,iVBORw...")
    // as it performs a split on the comma.
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<Omit<RegistrationFormData, 'logo'>>({
    name: '',
    phone: '',
    email: '',
    schoolName: '',
    city: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    let logoData = null;
    let logoMimeType = null;
    let logoFilename = null;

    if (logoFile) {
        try {
            const base64Data = await fileToBase64(logoFile);
            logoData = base64Data;
            logoMimeType = logoFile.type;
            logoFilename = logoFile.name;
        } catch (error) {
            setStatus('error');
            setMessage('Error processing the logo file. Please try again.');
            console.error('File to base64 conversion error:', error);
            return;
        }
    }

    const submissionPayload = {
      formType: 'registration',
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      school: formData.schoolName, // Map schoolName to school
      city: formData.city,
      logoData: logoData,
      logoMimeType: logoMimeType,
      logoFilename: logoFilename,
    };


    try {
      const response = await submitToGoogleScript(submissionPayload);
      if (response.success) {
        setStatus('success');
        setMessage(`Registration successful! Your Reference ID is: ${response.referenceId}`);
        setFormData({ name: '', phone: '', email: '', schoolName: '', city: '' });
        setLogoFile(null);
        const fileInput = document.getElementById('logo') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
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
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Institution Registration</h2>
      <p className="text-gray-600 mb-6">Fill out the form below to register your school.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries({
          name: { label: 'Contact Name', type: 'text', placeholder: 'John Doe' },
          phone: { label: 'Phone Number (preferably WhatsApp)', type: 'tel', placeholder: '123-456-7890' },
          email: { label: 'Email Address', type: 'email', placeholder: 'john.doe@example.com' },
          schoolName: { label: 'School Name', type: 'text', placeholder: 'Springfield Elementary' },
          city: { label: 'Area / City', type: 'text', placeholder: 'Springfield' },
        }).map(([key, { label, type, placeholder }]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={key}
              id={key}
              value={formData[key as keyof typeof formData]}
              onChange={handleChange}
              placeholder={placeholder}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">School Logo (Official Logo)</label>
          <input
            type="file"
            name="logo"
            id="logo"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">This cannot be changed later, so please select the file carefully.</p>
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
            ) : 'Register'}
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

export default RegistrationForm;