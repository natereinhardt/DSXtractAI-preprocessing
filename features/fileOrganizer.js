const fs = require('fs').promises;
const path = require('path');

class FileOrganizer {
  constructor() {
    this.stageDir = path.join(__dirname, '../../files/stage/stageFiles');
    
    // Create timestamped folder for this sorting session
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const sortedFolderName = `Sorted-${timestamp}`;
    
    this.finishedDir = path.join(__dirname, '../../files/finished');
    this.sortedDir = path.join(this.finishedDir, sortedFolderName);
    this.noPdfDir = path.join(this.sortedDir, 'A-NoPDFSFound');
  }

  /**
   * Main function to organize files by PDF
   */
  async organizeFilesByPdf() {
    try {
      console.log('Starting file organization...');
      
      // Ensure finished and sorted directories exist
      await fs.mkdir(this.finishedDir, { recursive: true });
      await fs.mkdir(this.sortedDir, { recursive: true });
      await fs.mkdir(this.noPdfDir, { recursive: true });

      // Get all folders in stageFiles
      const pinmapFolders = await this.getPinmapFolders();
      console.log(`Found ${pinmapFolders.length} pinmap folders to process`);

      // Group folders by PDF
      const groupingResult = await this.groupByPdf(pinmapFolders);
      console.log(`Organized into ${Object.keys(groupingResult.pdfGroups).length} PDF groups`);
      console.log(`Found ${groupingResult.foldersWithoutPdf.length} folders without PDFs`);

      // Move files to sorted directory
      const results = await this.moveToSorted(groupingResult);
      
      return {
        success: true,
        totalPinmaps: pinmapFolders.length,
        pdfGroups: Object.keys(groupingResult.pdfGroups).length,
        lostFolders: groupingResult.foldersWithoutPdf.length,
        sortedDirectory: this.sortedDir,
        details: results
      };
    } catch (error) {
      console.error('Error organizing files:', error);
      throw error;
    }
  }

  /**
   * Get all pinmap folders from stageFiles directory
   */
  async getPinmapFolders() {
    try {
      const entries = await fs.readdir(this.stageDir, { withFileTypes: true });
      return entries.filter(entry => entry.isDirectory()).map(dir => dir.name);
    } catch (error) {
      console.error('Error reading stage directory:', error);
      throw new Error(`Failed to read stage directory: ${error.message}`);
    }
  }

  /**
   * Group pinmap folders by their source PDF
   */
  async groupByPdf(pinmapFolders) {
    const pdfGroups = {};
    const foldersWithoutPdf = [];

    for (const folder of pinmapFolders) {
      const folderPath = path.join(this.stageDir, folder);
      
      try {
        // List files in the pinmap folder
        const files = await fs.readdir(folderPath);
        
        // Find the PDF file
        const pdfFile = files.find(file => file.endsWith('.pdf'));
        
        if (pdfFile) {
          // Use PDF name as the group key
          if (!pdfGroups[pdfFile]) {
            pdfGroups[pdfFile] = [];
          }
          pdfGroups[pdfFile].push({
            pinmapName: folder,
            folderPath: folderPath,
            files: files
          });
        } else {
          console.warn(`No PDF found in folder: ${folder}`);
          foldersWithoutPdf.push({
            pinmapName: folder,
            folderPath: folderPath,
            files: files
          });
        }
      } catch (error) {
        console.error(`Error processing folder ${folder}:`, error);
      }
    }

    return { pdfGroups, foldersWithoutPdf };
  }

  /**
   * Copy organized files to sorted directory
   */
  async moveToSorted(groupingResult) {
    const results = [];
    const { pdfGroups, foldersWithoutPdf } = groupingResult;

    // Process PDF groups
    for (const [pdfName, pinmaps] of Object.entries(pdfGroups)) {
      // Create PDF folder name (remove .pdf extension)
      const pdfFolderName = pdfName.replace('.pdf', '');
      const pdfDestPath = path.join(this.sortedDir, pdfFolderName);

      try {
        // Create PDF folder in finished directory
        await fs.mkdir(pdfDestPath, { recursive: true });

        let copiedFiles = 0;
        let pdfCopied = false;
        
        // Copy all files from each pinmap folder directly to PDF folder
        for (const pinmap of pinmaps) {
          try {
            // Copy all files from source to destination (flat structure)
            for (const file of pinmap.files) {
              const srcFile = path.join(pinmap.folderPath, file);
              
              // Skip redundant PDF copies - only copy the first one
              if (file.endsWith('.pdf')) {
                if (pdfCopied) {
                  continue; // Skip this PDF, we already have one
                }
                pdfCopied = true;
              }
              
              // Generate unique filename if needed to avoid overwriting
              let destFileName = file;
              if (!file.endsWith('.pdf')) {
                // For non-PDF files, prefix with pinmap name to avoid conflicts
                destFileName = `${pinmap.pinmapName}_${file}`;
              }
              
              const destFile = path.join(pdfDestPath, destFileName);
              
              // Copy file
              await fs.copyFile(srcFile, destFile);
              copiedFiles++;
            }

            console.log(`Copied files from ${pinmap.pinmapName} to ${pdfFolderName}`);
          } catch (error) {
            console.error(`Error copying files from ${pinmap.pinmapName}:`, error);
          }
        }

        results.push({
          pdfName: pdfName,
          folderName: pdfFolderName,
          filesProcessed: copiedFiles,
          totalPinmaps: pinmaps.length
        });

      } catch (error) {
        console.error(`Error creating PDF folder ${pdfFolderName}:`, error);
        results.push({
          pdfName: pdfName,
          error: error.message
        });
      }
    }

    // Handle folders without PDFs - move to A-NoPDFSFound directory
    await this.moveToNoPdfFound(foldersWithoutPdf);

    return results;
  }

  /**
   * Move loose files without PDFs directly to the A-NoPDFSFound directory (no subfolders)
   */
  async moveToNoPdfFound(foldersWithoutPdf) {
    const noPdfResults = [];
    
    for (const folder of foldersWithoutPdf) {
      try {
        // Copy all files directly to A-NoPDFSFound folder (flatten structure)
        for (const file of folder.files) {
          const srcFile = path.join(folder.folderPath, file);
          
          // Prefix filename with original folder name to avoid conflicts
          const prefixedFileName = `${folder.pinmapName}_${file}`;
          const destFile = path.join(this.noPdfDir, prefixedFileName);
          
          await fs.copyFile(srcFile, destFile);
        }
        
        console.log(`Moved ${folder.files.length} loose files from ${folder.pinmapName} to A-NoPDFSFound directory`);
        noPdfResults.push({
          folderName: folder.pinmapName,
          filesProcessed: folder.files.length,
          destination: 'A-NoPDFSFound'
        });
      } catch (error) {
        console.error(`Error moving files from ${folder.pinmapName} to A-NoPDFSFound:`, error);
      }
    }
    
    return noPdfResults;
  }

  /**
   * Optional: Clean up stage directory after successful copy
   * NOTE: This is commented out by default to preserve original files
   */
  // async cleanupStageFiles(pinmapFolders) {
  //   for (const folder of pinmapFolders) {
  //     const folderPath = path.join(this.stageDir, folder);
  //     try {
  //       await fs.rm(folderPath, { recursive: true, force: true });
  //       console.log(`Removed staged folder: ${folder}`);
  //     } catch (error) {
  //       console.error(`Error removing folder ${folder}:`, error);
  //     }
  //   }
  // }
}

module.exports = FileOrganizer;
