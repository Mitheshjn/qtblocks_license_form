// REPLACE THIS WITH YOUR ACTUAL GOOGLE SHEET ID
const SPREADSHEET_ID = '12hO9td8Y5dr0PPB4TnydLgNytyiV6OOl7lgj50PX1j4'; 
const REGISTRATION_SHEET_NAME = 'Registration_Data';
const MACHINE_ID_SHEET_NAME = 'Machine_ID_Submissions';
const DRIVE_ROOT_FOLDER_NAME = 'License_System';
const DRIVE_REGISTRATIONS_FOLDER_NAME = 'Registrations';

/**
 * Main function to handle POST requests from the React application.
 * @param {object} e The event object from the web app request.
 */
function doPost(e) {
  try {
    // When data is sent from a modern frontend using FormData with fetch,
    // the parameters are in e.parameter.
    const params = e.parameter;
    const formType = params.formType;

    if (formType === 'registration') {
      return handleRegistration(e);
    } else if (formType === 'machineIdSubmission') {
      return handleMachineIdSubmission(e);
    } else {
      return createJsonResponse({ success: false, message: 'Invalid form type specified.' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createJsonResponse({ success: false, message: 'An unexpected server error occurred: ' + error.message }, 500);
  }
}

/**
 * Handles the registration form submission.
 * It expects the logo as a base64 data string.
 * @param {object} e The event object.
 */
function handleRegistration(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet '${REGISTRATION_SHEET_NAME}' not found.`);
  }

  const params = e.parameter;
  const name = params.name;
  const phone = params.phone;
  const email = params.email;
  const school = params.school;
  const city = params.city;
  const timestamp = new Date();

  // Parameters for the base64 encoded logo
  const logoData = params.logoData; // The base64 string
  const logoMimeType = params.logoMimeType; // e.g., 'image/png'
  const logoFilename = params.logoFilename || 'school_logo'; // fallback filename

  let logoUrl = '';
  let folderUrl = '';
  const referenceId = generateReferenceId();

  try {
    if (logoData && logoMimeType) {
      const rootFolder = getOrCreateDriveFolder(DRIVE_ROOT_FOLDER_NAME);
      const registrationsFolder = getOrCreateDriveFolder(DRIVE_REGISTRATIONS_FOLDER_NAME, rootFolder.getId());
      
      const schoolFolderName = `${school}_${city}_${Date.now()}`; // Add timestamp to ensure uniqueness
      const schoolFolder = registrationsFolder.createFolder(schoolFolderName);
      folderUrl = schoolFolder.getUrl();
      
      // Decode the base64 string and create a file blob
      const decodedData = Utilities.base64Decode(logoData.split(',')[1]);
      const blob = Utilities.newBlob(decodedData, logoMimeType, logoFilename);
      
      const file = schoolFolder.createFile(blob);
      logoUrl = file.getUrl();
    }

    // Append data to the sheet
    sheet.appendRow([
      timestamp, name, phone, email, school, city, logoUrl, folderUrl, referenceId, 'No'
    ]);

    return createJsonResponse({ success: true, message: 'Registration submitted successfully!', referenceId: referenceId });

  } catch (error) {
    Logger.log('Error in handleRegistration: ' + error.toString());
    return createJsonResponse({ success: false, message: 'Error processing registration: ' + error.message }, 500);
  }
}

/**
 * Handles the machine ID submission form.
 * @param {object} e The event object.
 */
function handleMachineIdSubmission(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MACHINE_ID_SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet '${MACHINE_ID_SHEET_NAME}' not found.`);
  }

  const params = e.parameter;
  const referenceId = params.referenceId;
  const machineIdsJson = params.machineIds; // Expecting a JSON string of an array

  if (!referenceId) {
    return createJsonResponse({ success: false, message: 'Reference ID is required.' }, 400);
  }
  if (!machineIdsJson) {
    return createJsonResponse({ success: false, message: 'Machine IDs are required.' }, 400);
  }

  try {
    const machineIds = JSON.parse(machineIdsJson);
    if (!Array.isArray(machineIds) || machineIds.length === 0) {
      throw new Error('Machine IDs must be a non-empty array.');
    }

    const timestamp = new Date();
    const rows = machineIds.map(id => [timestamp, referenceId, id]);
    
    // Write all rows in a single operation for efficiency
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

    return createJsonResponse({ success: true, message: 'Machine IDs submitted successfully!' });

  } catch (error) {
    Logger.log('Error in handleMachineIdSubmission: ' + error.toString());
    return createJsonResponse({ success: false, message: 'Error processing machine IDs: ' + error.message }, 400);
  }
}

/**
 * Retrieves an existing Google Drive folder or creates a new one.
 */
function getOrCreateDriveFolder(folderName, parentFolderId = null) {
  const parent = parentFolderId ? DriveApp.getFolderById(parentFolderId) : DriveApp;
  const folders = parent.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parent.createFolder(folderName);
}

/**
 * Generates a simple unique reference ID.
 */
function generateReferenceId() {
  return Utilities.getUuid().substring(0, 8).toUpperCase();
}

/**
 * Creates a JSON response object for the web app.
 */
function createJsonResponse(data, statusCode = 200) {
  // Apps Script Web Apps don't truly support setting HTTP status codes.
  // The client must inspect the JSON body for a success flag.
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
