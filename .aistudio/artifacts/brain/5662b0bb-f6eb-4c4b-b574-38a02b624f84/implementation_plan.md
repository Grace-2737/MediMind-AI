# Guide & Resolution: Running MediMind AI in VS Code on Windows (Fixing ERESOLVE)

This plan provides the exact steps to resolve the `ERESOLVE peer dependency conflict` during `npm install` in Visual Studio Code on Windows 10/11 and run the application locally on `http://localhost:3000`.

---

### Root Cause Analysis: ERESOLVE Peer Dependency Conflict

- **Cause**: Modern npm (v7+) enforces strict peer dependency validation. Because the project uses React 19 (`react@^19.0.1`) alongside packages whose package metadata specifies peer dependencies on React 18, standard `npm install` throws an `ERESOLVE unable to resolve dependency tree` error.
- **Solution**: 
  1. We added an `.npmrc` file directly to the project root with `legacy-peer-deps=true`. This instructs npm to automatically bypass strict peer dependency matching for all installs.
  2. In your VS Code terminal, executing `npm install --legacy-peer-deps` explicitly resolves the dependency tree cleanly without conflicts.

---

### Step-by-Step Execution Plan

#### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Go to **File > Open Folder...**.
3. Select the extracted root directory (the folder where `package.json`, `server.ts`, and `vite.config.ts` are located).
4. Open the integrated terminal in VS Code:
   - Press **Ctrl + `** (backtick) or select **Terminal > New Terminal** from the top menu.

#### Step 2: Install Dependencies Without Errors
In the VS Code terminal (PowerShell or Command Prompt), run:
```powershell
npm install --legacy-peer-deps
```
> **Note**: Because `.npmrc` has now been created with `legacy-peer-deps=true`, even running `npm install` directly will automatically honor legacy peer resolution.

#### Step 3: Configure Local Environment Variables
1. Create a `.env` file from the provided `.env.example`:
   - In PowerShell:
     ```powershell
     Copy-Item .env.example .env
     ```
   - Or in Command Prompt:
     ```cmd
     copy .env.example .env
     ```
   - Or right-click `.env.example` in the VS Code file explorer, select **Copy**, paste it, and rename it to `.env`.
2. Open `.env` in VS Code and verify:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   PORT=3000
   ```
   *(If you do not have an API key yet, the UI will still load and run with sample reports; add a key from Google AI Studio whenever you want live OCR analysis).*

#### Step 4: Run the Development Server
In the VS Code integrated terminal, execute:
```powershell
npm run dev
```
You will see output indicating that Express and Vite are serving the app on port 3000:
```text
> tsx server.ts
Express server running on http://localhost:3000
Vite v8.x ready in ... ms
```

#### Step 5: Open the Application in Your Browser
Open your browser (Chrome, Edge, Brave, or Firefox) and navigate to:
```
http://localhost:3000
```

---

### Windows-Specific Troubleshooting

| Issue / Error | Cause | Quick Fix |
|---|---|---|
| **`File ... cannot be loaded because running scripts is disabled on this system`** | Windows PowerShell execution policy restriction. | In VS Code terminal, run:<br>`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`<br>or switch the VS Code terminal profile from PowerShell to Command Prompt (`cmd`). |
| **`node: command not found` or `'npm' is not recognized`** | Node.js is not installed or not in Windows PATH. | Install the Node.js LTS installer (v20.x) from [nodejs.org](https://nodejs.org/), restart VS Code, and retry. |
| **`Port 3000 is already in use`** | Another application or previous node process is holding port 3000. | Change `PORT=3001` in your `.env` file or kill the existing process via PowerShell:<br>`Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force` |
| **`ERESOLVE unable to resolve dependency tree`** | Strict peer dependency checks on npm v7+. | Run `npm install --legacy-peer-deps` (or ensure `.npmrc` with `legacy-peer-deps=true` is present in the folder). |

---

### Verification Checklist

- [ ] `.npmrc` created in project root with `legacy-peer-deps=true`.
- [ ] `npm install --legacy-peer-deps` runs to completion and generates `node_modules`.
- [ ] `.env` file copied and configured.
- [ ] `npm run dev` starts the Express + Vite server without fatal errors.
- [ ] Browser loads `http://localhost:3000` with full UI, navigation, and auth portals.
