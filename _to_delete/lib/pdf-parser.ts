// lib/pdf-parser.ts

export async function parsePDF(buffer: Buffer): Promise<string> {
    // PDF parsing is disabled due to compatibility issues with Next.js
    throw new Error('PDF files are not supported. Please convert your resume to DOCX format and try again.');
  }
  
  export async function parseDOCX(buffer: Buffer): Promise<string> {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error: any) {
      console.error('Error parsing DOCX:', error);
      throw new Error(`Failed to parse DOCX file: ${error.message}`);
    }
  }
  
  