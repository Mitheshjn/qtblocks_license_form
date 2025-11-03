// ===============================================================
// CONFIGURATION
// ===============================================================
// REPLACE THIS WITH YOUR ACTUAL GOOGLE SHEET ID
const SPREADSHEET_ID = '12hO9td8Y5dr0PPB4TnydLgNytyiV6OOl7lgj50PX1j4'; 
const REGISTRATION_SHEET_NAME = 'Registration_Data';
const MACHINE_ID_SHEET_NAME = 'Machine_ID_Submissions';
const DASHBOARD_SHEET_NAME = 'License_Dashboard';

// ===============================================================
// WEB APP LOGIC (Handles Frontend Submissions)
// ===============================================================

function doPost(e) {
  try {
    const params = e.parameter;
    if (params.formType === 'registration') {
      return handleRegistration(e);
    } else if (params.formType === 'machineIdSubmission') {
      return handleMachineIdSubmission(e);
    }
    return createJsonResponse({ success: false, message: 'Invalid form type.' });
  } catch (error) {
    Logger.log(`doPost Error: ${error.toString()} Stack: ${error.stack}`);
    return createJsonResponse({ success: false, message: 'Server error: ' + error.message });
  }
}

function handleRegistration(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const registrationSheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);
  const dashboardSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  const { name, phone, email, school, city, logoData, logoMimeType, logoFilename } = e.parameter;
  
  const referenceId = generateUniqueReferenceId(registrationSheet);
  
  const rootFolder = DriveApp.getFoldersByName('License_System').next();
  const registrationsFolder = rootFolder.getFoldersByName('Registrations').next();
  const schoolFolder = registrationsFolder.createFolder(`${school}_${city}_${Date.now()}`);
  const licensesFolder = schoolFolder.createFolder('Licenses');
  const machineIdTxtFile = schoolFolder.createFile(`${referenceId}_MachineIDs.txt`, 'IDs will be populated here using the License Tools menu.', MimeType.PLAIN_TEXT);

  let logoUrl = '';
  if (logoData && logoMimeType) {
    const blob = Utilities.newBlob(Utilities.base64Decode(logoData.split(',')[1]), logoMimeType, logoFilename || 'logo');
    logoUrl = schoolFolder.createFile(blob).getUrl();
  }

  registrationSheet.appendRow([new Date(), name, phone, email, school, city, logoUrl, schoolFolder.getUrl(), referenceId, 'No']);
  dashboardSheet.appendRow([referenceId, school, city, schoolFolder.getUrl(), 'No', '', 'No', machineIdTxtFile.getUrl(), 'No', licensesFolder.getUrl()]);

  return createJsonResponse({ success: true, message: 'Registration successful!', referenceId: referenceId });
}

function handleMachineIdSubmission(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const submissionSheet = ss.getSheetByName(MACHINE_ID_SHEET_NAME);
  const dashboardSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  const { referenceId, machineIds: machineIdsJson } = e.parameter;

  const machineIds = JSON.parse(machineIdsJson);
  if (!Array.isArray(machineIds) || machineIds.length === 0) throw new Error('Machine IDs must be a non-empty array.');

  const timestamp = new Date();
  const rows = machineIds.map(id => [timestamp, referenceId, id]);
  submissionSheet.getRange(submissionSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  
  const dashboardData = dashboardSheet.getDataRange().getValues();
  const refIdColumnIndex = dashboardData[0].indexOf('Reference ID');
  const schoolRowIndex = dashboardData.findIndex(row => row[refIdColumnIndex] === referenceId) + 1;
  if (schoolRowIndex > 0) {
    dashboardSheet.getRange(schoolRowIndex, dashboardData[0].indexOf('Machine IDs Submitted?') + 1).setValue('Yes');
  }

  return createJsonResponse({ success: true, message: 'Machine IDs submitted. Use the Sheet Tool to sync them.' });
}

// ===============================================================
// GOOGLE SHEETS UI & TOOLS LOGIC
// ===============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('License Tools')
    .addItem('Upload License/EXE File', 'showUploadSidebar')
    .addSeparator()
    .addItem('Sync Machine IDs to TXT', 'showMachineIdSidebar')
    .addToUi();
}

// --- FILE UPLOADER LOGIC (FIXED) ---
function showUploadSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('SidebarUI').setTitle('File Uploader');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Extracts a Google Drive folder/file ID from a URL.
 * @param {string} url The Google Drive URL.
 * @returns {string|null} The extracted ID or null if not found.
 */
function getIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/[-\w]{25,}/); // Regex to find a string of 25+ letters, numbers, -, _
  return match ? match[0] : null;
}

function uploadFileToDrive(formObject) {
  try {
    const { referenceId, fileData, fileName, mimeType } = formObject;
    if (!referenceId) throw new Error("Reference ID is required.");

    const dashboardSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DASHBOARD_SHEET_NAME);
    const dashboardData = dashboardSheet.getDataRange().getValues();
    const headers = dashboardData[0];
    const schoolRowIndex = dashboardData.findIndex(row => row[headers.indexOf('Reference ID')] === referenceId);

    if (schoolRowIndex === -1) throw new Error(`Reference ID "${referenceId}" not found in dashboard.`);

    const schoolRow = dashboardData[schoolRowIndex];
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData.split(',')[1]), mimeType, fileName);
    
    let targetFolder, linkColumnIndex;
    let folderId;

    if (fileName.endsWith('.exe')) {
      const folderUrl = schoolRow[headers.indexOf('Drive Folder Link')];
      folderId = getIdFromUrl(folderUrl);
      if (!folderId) throw new Error("Main 'Drive Folder Link' is missing or invalid in the sheet.");
      targetFolder = DriveApp.getFolderById(folderId);
      linkColumnIndex = headers.indexOf('Drive EXE Link') + 1;
    } else {
      const licenseFolderUrl = schoolRow[headers.indexOf('License Folder Link')];
      folderId = getIdFromUrl(licenseFolderUrl);
      if (!folderId) throw new Error("'License Folder Link' is missing or invalid in the sheet.");
      targetFolder = DriveApp.getFolderById(folderId);
      // No specific column to update for general license files, so linkColumnIndex remains undefined.
    }

    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    if (linkColumnIndex) {
      dashboardSheet.getRange(schoolRowIndex + 1, linkColumnIndex).setValue(file.getUrl());
    }
    
    return { success: true, message: `Uploaded "${fileName}" successfully.` };
  } catch (error) {
    Logger.log(`uploadFileToDrive Error: ${error.toString()}`);
    return { success: false, message: 'Upload failed: ' + error.message };
  }
}


// --- MACHINE ID SYNC LOGIC ---
function showMachineIdSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('MachineIdUI').setTitle('Machine ID Sync');
  SpreadsheetApp.getUi().showSidebar(html);
}

function getMachineIdsForReferenceId(referenceId) {
  const submissionSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MACHINE_ID_SHEET_NAME);
  const allData = submissionSheet.getDataRange().getValues();
  const headers = allData.shift(); 
  const refIdCol = headers.indexOf('Reference_ID');
  const machineIdCol = headers.indexOf('Machine_ID');

  const matchingIds = allData
    .filter(row => row[refIdCol] === referenceId)
    .map(row => row[machineIdCol]);

  return matchingIds;
}

function updateMachineIdTxtFile(referenceId, idsContent) {
  try {
    const dashboardSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DASHBOARD_SHEET_NAME);
    const dashboardData = dashboardSheet.getDataRange().getValues();
    const headers = dashboardData[0];
    const schoolRow = dashboardData.find(row => row[headers.indexOf('Reference ID')] === referenceId);

    if (!schoolRow) throw new Error("Reference ID not found in the dashboard.");
    
    const txtFileUrl = schoolRow[headers.indexOf('Machine IDs TXT File Link')];
    const fileId = getIdFromUrl(txtFileUrl);
    if (!fileId) throw new Error("Could not extract a valid file ID from the TXT File URL in the sheet.");

    const file = DriveApp.getFileById(fileId);
    file.setContent(idsContent);

    return { success: true, message: 'TXT file updated successfully!' };
  } catch (error) {
    Logger.log(`updateMachineIdTxtFile Error: ${error.toString()}`);
    return { success: false, message: 'Failed to update TXT file: ' + error.message };
  }
}

// ===============================================================
// UTILITY FUNCTIONS
// ===============================================================

function generateUniqueReferenceId(sheet) {
  let isUnique = false, newId;
  const existingIds = sheet.getRange(2, 9, sheet.getLastRow(), 1).getValues().flat();
  while (!isUnique) {
    newId = Utilities.getUuid().substring(0, 8).toUpperCase();
    if (!existingIds.includes(newId)) isUnique = true;
  }
  return newId;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}