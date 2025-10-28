// IMPORTANT: Replace this with the URL you get after deploying your Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3tYFLPhyC-CpHNEi0isHLoULkYdCK_pDID_URUbm435sg4MLtR4YBmLyXLgMLBRN7/exec';

export const submitToGoogleScript = async (payload: Record<string, any>): Promise<any> => {
  if (APPS_SCRIPT_URL.includes('YOUR_WEB_APP_URL_HERE') || !APPS_SCRIPT_URL) {
    throw new Error('Please update the APPS_SCRIPT_URL in services/googleAppsScriptService.ts with your Google Apps Script Web App URL.');
  }

  // The new Apps Script code expects data in e.parameter, which corresponds to form data submission.
  // We need to build a FormData object from our payload.
  const formData = new FormData();
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== null && payload[key] !== undefined) {
      const value = payload[key];
      // The backend expects machineIds as a JSON string array.
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }

  try {
    // We send POST request with FormData. Fetch will automatically set the correct Content-Type.
    // The previous implementation sent JSON as text/plain, which is processed via e.postData.contents.
    // The new script uses e.parameter, which requires a form data submission.
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      // No 'Content-Type' header needed; browser sets it for FormData.
    });
    
    if (!response.ok) {
        let errorDetails = `Server responded with status: ${response.status}`;
        try {
            const errorText = await response.text();
            console.error("Google Apps Script Error Response Text:", errorText);
            errorDetails += ` - ${errorText.substring(0, 500)}`;
        } catch (e) {
            // ignore if we can't read body
        }
        throw new Error(errorDetails);
    }

    // Google Apps Script Web Apps, when returning ContentService.MimeType.JSON,
    // can be consumed directly.
    return response.json();
  } catch (error) {
    console.error("Error submitting to Google Apps Script:", error);
    if (error instanceof Error) {
        throw new Error(`Could not connect to the backend service: ${error.message}`);
    }
    throw new Error("Could not connect to the backend service. Please check your internet connection and the App Script URL.");
  }
};
