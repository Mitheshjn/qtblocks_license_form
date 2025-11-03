# Smart License & ID System - Full Documentation

## 1. Product Overview

The **Smart License & ID System** is a streamlined web application designed for educational institutions or organizations to manage software license registrations and device machine ID submissions. It provides a simple, user-friendly interface for administrators to register their institution and a separate interface to submit unique machine identifiers required for software activation.

The application is built as a serverless frontend that communicates directly with a Google Workspace backend (Google Sheets and Google Drive) via a Google Apps Script, making it a cost-effective and easy-to-manage solution.

### 1.1. Target Audience

*   School IT Administrators
*   Software vendors managing educational licenses
*   Organizations needing a simple system to collect registration data and device IDs.

### 1.2. Key Features

*   **Institution Registration:** A clean form for schools to submit their contact details, school information, and upload a logo.
*   **Unique Reference ID:** Upon successful registration, a unique Reference ID is generated and displayed, linking all future submissions to that institution.
*   **Machine ID Submission:** A dedicated form for submitting one or more device machine IDs using the generated Reference ID.
*   **QR Code Scanning:** An integrated QR code scanner allows users to easily input machine IDs by scanning a QR code with their device's camera, reducing manual entry errors.
*   **Serverless Architecture:** Utilizes Google Sheets as a database and Google Drive for file storage, managed by a Google Apps Script. This eliminates the need for a dedicated server.
*   **Responsive Design:** The UI is fully responsive and works seamlessly on desktops, tablets, and mobile devices.

## 2. Technology Stack

*   **Frontend:**
    *   **Framework:** React
    *   **Language:** TypeScript
    *   **Styling:** Tailwind CSS
    *   **QR Scanning:** `html5-qrcode` library
*   **Backend:**
    *   **API:** Google Apps Script (acting as a web app)
    *   **Database:** Google Sheets
    *   **File Storage:** Google Drive

## 3. Project Structure

The project is organized into a clear and maintainable structure.

```
/
├── components/
│   ├── HomePage.tsx         # The main landing page with navigation options.
│   ├── RegistrationForm.tsx # Form for new school/institution registration.
│   ├── SubmissionForm.tsx   # Form for submitting machine IDs.
│   ├── QrScanner.tsx        # Modal component for camera-based QR code scanning.
│   └── SetupGuide.tsx       # Component displaying backend setup instructions.
│
├── services/
│   └── googleAppsScriptService.ts # Handles communication with the Google Apps Script backend.
│
├── types.ts                 # TypeScript type definitions for the application.
│
├── App.tsx                  # Main application component, handles routing.
├── Code.gs                  # Google Apps Script backend code.
├── SidebarUI.html           # HTML for the admin sidebar in Google Sheets.
├── index.html               # The main HTML file.
├── index.tsx                # The entry point of the React application.
└── metadata.json            # Application metadata and permission requests.
```

## 4. Backend Setup Guide

This application requires a Google Workspace backend. Follow these steps precisely to configure it.

1.  **Create Google Sheet:**
    *   Create a new Google Sheet named `License System Data`.
    *   Create three sheet tabs with the exact names: `Registration_Data`, `Machine_ID_Submissions`, and `License_Dashboard`.
    *   Set up the headers for **Registration_Data**:
      `Timestamp, Name, Phone, Email, School, City, Logo_URL, Folder_URL, Reference_ID, Verified`
    *   Set up the headers for **Machine_ID_Submissions**:
      `Timestamp, Reference_ID, Machine_ID`
    *   Set up the headers for **License_Dashboard**:
      `Reference ID, School Name, City, Drive Folder Link, Verified?, Drive EXE Link, Machine IDs Submitted?, Machine ID TXT Link, License Generated?, License Folder Link, License File Link`

2.  **Create Google Drive Folder:**
    *   In your Google Drive, create a new folder named `License_System`.
    *   Inside it, create another folder named `Registrations`.

3.  **Create and Deploy Google Apps Script:**
    *   Open your Google Sheet, go to **Extensions > Apps Script**.
    *   In the script editor, replace any boilerplate code in `Code.gs` with the entire content from the `Code.gs` file provided with this project.
    *   Click the `+` icon next to "Files" and select "HTML". Name the new file `SidebarUI` and press Enter. Replace its content with the code from the `SidebarUI.html` file.
    *   In the `Code.gs` file, find the `SPREADSHEET_ID` constant and replace the placeholder value with your actual Google Sheet ID (from the URL).
    *   Click the **Deploy** button, then **New deployment**.
    *   Select type **Web app**.
    *   In the dialog:
        *   Set "Execute as" to **Me**.
        *   Set "Who has access" to **Anyone**.
    *   Click **Deploy**. Authorize the script permissions when prompted.
    *   Copy the generated **Web app URL**.

4.  **Connect Frontend to Backend:**
    *   Open the file `services/googleAppsScriptService.ts` in this project.
    *   Find the constant `APPS_SCRIPT_URL`.
    *   Paste your copied Web app URL as its value. Your application is now fully configured!

## 5. Local Development & Running

For robust development, it's best to set up a standard local development environment with Node.js. We will use **Vite** as our build tool for its speed and simplicity.

### 5.1. Prerequisites

*   **Node.js:** Version 18.x or higher, available from [nodejs.org](https://nodejs.org/).
*   **npm:** (Node Package Manager) which comes bundled with Node.js.

### 5.2. Step 1: Download the Project Files

1.  Create a new folder on your computer for the project, e.g., `smart-license-system`.
2.  Inside this folder, recreate the project structure and copy the content of all the provided files into their corresponding locations.

### 5.3. Step 2: Initialize a Node.js Project

1.  Open your terminal and navigate into the project folder:
    ```bash
    cd smart-license-system
    ```
2.  Initialize a `package.json` file:
    ```bash
    npm init -y
    ```

### 5.4. Step 3: Install Dependencies

Install **Vite**, **React**, **TypeScript**, and other necessary development tools:
```bash
npm install react react-dom
npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom tailwindcss postcss autoprefixer
```

### 5.5. Step 4: Configure the Development Environment

1.  **Create `vite.config.ts`** in the project root:
    ```typescript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig({
      plugins: [react()],
      server: {
        port: 3000
      }
    })
    ```

2.  **Create `tsconfig.json`** in the project root:
    ```json
    {
      "compilerOptions": {
        "target": "ESNext",
        "useDefineForClassFields": true,
        "lib": ["DOM", "DOM.Iterable", "ESNext"],
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "module": "ESNext",
        "moduleResolution": "Node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx"
      },
      "include": ["."],
      "exclude": ["node_modules"]
    }
    ```

3.  **Configure Tailwind CSS:**
    Run `npx tailwindcss init -p` to generate `tailwind.config.js` and `postcss.config.js`. Then, update `tailwind.config.js`:
    ```javascript
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
      ],
      theme: { extend: {} },
      plugins: [],
    }
    ```

4.  **Create `index.css`** in the project root:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

### 5.6. Step 5: Update Project Files

1.  **Update `index.html`:** Remove the CDN scripts for React and Tailwind and link to your local entry points.
    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Smart License & ID System</title>
        <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
      </head>
      <body class="bg-gray-100">
        <div id="root"></div>
        <script type="module" src="/index.tsx"></script>
      </body>
    </html>
    ```

2.  **Update `index.tsx`:** Import the new CSS file.
    ```typescript
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import './index.css'; // Add this line

    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    ```

### 5.7. Step 6: Add Scripts to `package.json`

Open `package.json` and add the following `scripts`:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
},
```

### 5.8. Step 7: Run the App Locally

You can now run the development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser to see the application.

## 6. Deployment to GitHub Pages

### 6.1. Step 1: Create and Push to a GitHub Repository

1.  Go to [GitHub](https://github.com/) and create a new repository (e.g., `smart-license-system`).
2.  Initialize git locally and push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/your-username/smart-license-system.git
    git push -u origin main
    ```

### 6.2. Step 2: Configure Project for Deployment

1.  **Set homepage in `package.json`:**
    ```json
    "homepage": "https://your-username.github.io/smart-license-system",
    ```

2.  **Set base path in `vite.config.ts`:**
    ```typescript
    export default defineConfig({
      base: '/smart-license-system/', 
      plugins: [react()],
      // ...
    })
    ```

### 6.3. Step 3: Deploy

1.  **Install `gh-pages`:**
    ```bash
    npm install --save-dev gh-pages
    ```

2.  **Add deploy scripts to `package.json`:**
    ```json
    "scripts": {
      "dev": "vite",
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    ```

3.  **Run the deploy command:**
    ```bash
    npm run deploy
    ```

4.  **Configure GitHub Pages Source:**
    *   In your GitHub repository, go to **Settings > Pages**.
    *   Under "Build and deployment", select **Source** as **Deploy from a branch**.
    *   Set the **Branch** to `gh-pages` and the folder to `/(root)`.
    *   Click **Save**. Your site will be live in a few minutes.