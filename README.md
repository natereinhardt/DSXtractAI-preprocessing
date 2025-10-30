# DSXtractAI PDF Organizer

**Automatically sort and clean your PDF files with their associated data**

This tool helps you organize scattered PDF documents and their related files (like pinmaps, images, or data files) into neat, sorted folders. Think of it like a smart filing cabinet that automatically groups documents by their source PDF.

## What This Tool Does

🔄 **Automatic PDF Sorting**: Finds PDF files scattered across multiple folders and groups all related files together

📁 **Smart Organization**: Creates timestamped folders so you never lose track of when files were sorted

🧹 **File Cleaning**: Removes duplicate PDFs and organizes loose files that don't have a matching PDF

⚡ **Web Interface**: Simple web-based controls - no command line knowledge needed

## How It Works (Simple Explanation)

Imagine you have a messy desk with:
- Multiple folders containing PDF manuals
- Each folder also has related images, data files, or notes
- Some folders might be missing their PDF entirely

This tool:
1. **Scans** all your folders in a "staging" area
2. **Identifies** which PDF each folder belongs to
3. **Groups** all folders that share the same PDF together
4. **Creates** organized folders named after each PDF
5. **Moves** all related files into their proper PDF folder
6. **Handles** orphaned files (files without PDFs) separately

## Quick Start Guide

### Prerequisites (One-Time Setup)

You'll need these installed on your computer:
- **Node.js** (Download from [nodejs.org](https://nodejs.org) - choose the LTS version)
- A web browser (Chrome, Firefox, Safari, etc.)

### Installation Steps

1. **Download this project** to your computer
2. **Open Terminal/Command Prompt** and navigate to the project folder
3. **Install dependencies** by running:
   ```bash
   npm install
   ```

### Running the Organizer

1. **Start the program**:
   ```bash
   npm start
   ```
   
2. **Open your web browser** and go to: `http://localhost:3000`

3. **View the API interface** at: `http://localhost:3000/api-docs`

## File Structure Setup

**IMPORTANT:** All files must be within the project directory structure. The tool looks for files inside the `DSXtractAI-preprocessing` project folder.

Before using the organizer, set up your folders like this:

```
DSXtractAI-preprocessing/          ← Your project root
├── features/
├── node_modules/
├── files/                         ← Create this folder
│   ├── stage/                     ← Put your messy folders here
│   │   ├── folder1/              ← Contains PDF + related files
│   │   ├── folder2/              ← Contains PDF + related files
│   │   └── folder3/              ← Maybe just loose files
│   └── finished/                 ← Organized results go here (auto-created)
├── package.json
└── server.js
```

**Backwards Compatibility Note:**  
If you have an existing `files/stage/stageFiles/` directory, the tool will automatically detect and use it. Otherwise, it will use `files/stage/` directly.

### Setting Up Your Input Folder

1. Create the folder structure inside your project: `files/stage/`
2. Put all your disorganized folders directly into the `stage/` folder
3. Each folder should contain:
   - One PDF file (the "master" document)
   - Any number of related files (images, data, notes)

**Example:**
```
DSXtractAI-preprocessing/files/stage/
├── pinmap_001/
│   ├── document.pdf
│   ├── image1.jpg
│   └── data.csv
└── pinmap_002/
    ├── manual.pdf
    └── schematic.png
```

## Using the Organizer

### Method 1: Web Interface (Recommended for Beginners)

**What is Swagger?** Swagger creates a visual, clickable interface for your API - think of it as a control panel with buttons you can click instead of typing commands.

**Step-by-Step Instructions:**

1. **Start the server** by opening Terminal/Command Prompt in your project folder and running:
   ```bash
   npm start
   ```
   Wait until you see: `🚀 Server running on port 3000`

2. **Open the Swagger interface** by going to this address in your web browser:
   ```
   http://localhost:3000/api-docs
   ```
   You should see a page titled "DSXtractAI Preprocessing API"

3. **Locate the file organization tool**:
   - Scroll down to find a green section labeled **"File Organization"**
   - You'll see a green box that says **"POST /organize-files"**

4. **Open the organizer controls**:
   - Click on the **"POST /organize-files"** green box
   - It will expand to show details about organizing pinmap files

5. **Activate the test interface**:
   - Look for a blue button that says **"Try it out"** on the right side
   - Click this button - it will change to say "Cancel" and unlock the interface

6. **Run the organizer**:
   - A blue **"Execute"** button will appear
   - Click **"Execute"** to start organizing your files
   - The button may show a loading spinner while processing

7. **View the results**:
   - Scroll down to see the "Response body" section
   - Look for a green "200" response code (this means success!)
   - The response will show:
     - `totalPinmaps`: How many folders were processed  
     - `pdfGroups`: How many different PDFs were found
     - `lostFolders`: Folders without PDFs
     - `details`: Specific information about what was organized

**What you'll see when it works:**
```json
{
  "success": true,
  "totalPinmaps": 15,
  "pdfGroups": 4, 
  "lostFolders": 2,
  "sortedDirectory": "/path/to/files/finished/Sorted-2024-01-15T10-30-00"
}
```

### Method 2: Direct API Call

If you're comfortable with web tools, send a POST request to:
```
http://localhost:3000/organize-files
```

## What Happens After Organization

The tool creates a new timestamped folder in `files/finished/` with this structure:

```
finished/
└── Sorted-2024-01-15T10-30-00/
    ├── Manual_A/                    ← All files related to Manual_A.pdf
    │   ├── Manual_A.pdf
    │   ├── folder1_image1.jpg
    │   └── folder2_data.csv
    ├── Manual_B/                    ← All files related to Manual_B.pdf
    │   ├── Manual_B.pdf
    │   └── folder3_schematic.png
    └── A-NoPDFSFound/              ← Files without matching PDFs
        ├── folder4_orphan1.txt
        └── folder5_orphan2.jpg
```

### Key Benefits of This Organization:

- **No duplicates**: Only one copy of each PDF per group
- **Clear naming**: Files are prefixed with their source folder name
- **Safe operation**: Original files stay in place (copied, not moved)
- **Timestamp tracking**: Each sort creates a new dated folder
- **Orphan handling**: Files without PDFs go to a special "NoPDFSFound" folder

## Understanding the Results

After running the organizer, you'll get a summary like:

```json
{
  "success": true,
  "totalPinmaps": 10,        ← Total folders processed
  "pdfGroups": 3,            ← Number of different PDFs found
  "lostFolders": 2,          ← Folders without PDFs
  "details": [...]
}
```

## Troubleshooting

### Common Issues:

**"No folders found"**
- Check that your folders are in `files/stage/` within the project directory
- Make sure you created the `files/stage/` folder inside `DSXtractAI-preprocessing/`
- Verify the folder path: `<project-root>/files/stage/`

**"Port already in use"**
- Another program is using port 3000
- Try changing the port: `PORT=3001 npm start`

**"Files not organizing correctly"**
- Ensure each input folder contains exactly one PDF
- Check that PDF files have the `.pdf` extension

**"Permission errors"**
- Make sure you have read/write access to the files folder
- Try running with administrator privileges if on Windows

### Getting Help:

- Check the console output for detailed error messages
- Look at `http://localhost:3000/health` to verify the server is running
- Review the API docs at `http://localhost:3000/api-docs`

## Advanced Usage

### Custom Folder Locations

All paths are relative to the project root. The default locations are:
- **Input:** `<project-root>/files/stage/`
- **Output:** `<project-root>/files/finished/`

You can modify these paths in `features/fileOrganizer.js`:
- Change `this.baseStageDir` for input location
- Change `this.finishedDir` for output location

### Running in Development Mode

For automatic restart when making changes:
```bash
npm run dev
```

## Safety Features

- **Non-destructive**: Original files are copied, never moved or deleted
- **Timestamped outputs**: Each run creates a unique folder
- **Error logging**: Detailed console output for troubleshooting
- **Graceful handling**: Continues processing even if individual folders fail

## File Naming Logic

The organizer follows these rules:
- PDF folders are named after the PDF file (without .pdf extension)
- Non-PDF files get prefixed with their source folder name
- Multiple files with the same name won't overwrite each other
- The first PDF found becomes the "master" for that group

---

**Need help?** This tool is designed to be safe and user-friendly. Your original files are never deleted, so you can always try again if something doesn't work as expected.