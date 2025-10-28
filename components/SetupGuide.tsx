
import React from 'react';

const SetupGuide: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Backend Setup Guide
      </h2>
      <p className="mb-6 text-gray-600">
        Follow these steps to connect this website to your Google Account for data storage.
      </p>
      <ol className="list-decimal list-inside space-y-6 text-gray-700">
        <li>
          <strong>Create Google Sheet:</strong>
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 bg-gray-50 p-4 rounded-md">
            <li>Create a new Google Sheet named <code className="bg-gray-200 px-1 rounded">License System Data</code>.</li>
            <li>Rename the first sheet tab to <code className="bg-gray-200 px-1 rounded">Registration_Data</code>.</li>
            <li>Add a second sheet tab and name it <code className="bg-gray-200 px-1 rounded">Machine_ID_Submissions</code>.</li>
            <li>Set up the headers for <strong>Registration_Data</strong>: <br />
              <code className="text-xs bg-gray-200 p-1 rounded">Timestamp, Name, Phone, Email, School, City, Logo_URL, Folder_URL, Reference_ID, Verified</code>
            </li>
            <li>Set up the headers for <strong>Machine_ID_Submissions</strong>: <br />
              <code className="text-xs bg-gray-200 p-1 rounded">Timestamp, Reference_ID, Machine_ID</code>
            </li>
          </ul>
        </li>
        <li>
          <strong>Create Google Drive Folder:</strong>
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 bg-gray-50 p-4 rounded-md">
            <li>In your Google Drive, create a new folder named <code className="bg-gray-200 px-1 rounded">License_System</code>.</li>
            <li>Inside it, create another folder named <code className="bg-gray-200 px-1 rounded">Registrations</code>. This is where school logo folders will be stored.</li>
          </ul>
        </li>
        <li>
          <strong>Create and Deploy Google Apps Script:</strong>
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 bg-gray-50 p-4 rounded-md">
            <li>Open your Google Sheet, go to <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Delete any boilerplate code and paste the entire content from the <code className="bg-gray-200 px-1 rounded">Code.gs</code> file provided.</li>
            <li>In the script, replace <code className="bg-red-200 px-1 rounded">'YOUR_SPREADSHEET_ID_HERE'</code> with your actual Google Sheet ID (from the URL).</li>
            <li>Click the <strong>Deploy</strong> button, then <strong>New deployment</strong>.</li>
            <li>Select type <strong>Web app</strong>.</li>
            <li>In the dialog:
              <ul>
                <li>- Set "Execute as" to <strong>Me</strong>.</li>
                <li>- Set "Who has access" to <strong>Anyone</strong>.</li>
              </ul>
            </li>
            <li>Click <strong>Deploy</strong>. Authorize the script permissions when prompted.</li>
            <li>Copy the generated <strong>Web app URL</strong>.</li>
          </ul>
        </li>
        <li>
          <strong>Connect Frontend to Backend:</strong>
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 bg-gray-50 p-4 rounded-md">
            <li>Open the file <code className="bg-gray-200 px-1 rounded">services/googleAppsScriptService.ts</code> in this project.</li>
            <li>Find the constant <code className="bg-gray-200 px-1 rounded">APPS_SCRIPT_URL</code>.</li>
            <li>Paste your copied Web app URL as its value.</li>
            <li>Your application is now fully configured!</li>
          </ul>
        </li>
      </ol>
    </div>
  );
};

export default SetupGuide;
