// pdfUtils.ts
export interface PDFValidationOptions {
  maxSizeInMB?: number;
  maxWordCount?: number;
}

export interface PDFValidationResult {
  isValid: boolean;
  error?: string;
  wordCount?: number;
  file?: File;
}

export const validatePDF = async (
  file: File,
  options: PDFValidationOptions = {}
): Promise<PDFValidationResult> => {
  const {
    maxSizeInMB = 5,
    // maxWordCount = 5000
  } = options;

  // Check file type
  if (file.type !== "application/pdf") {
    return {
      isValid: false,
      error: "Only PDF files are allowed."
    };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB.`
    };
  }

  try {
    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    
    // Check PDF header
    const firstBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const header = new TextDecoder().decode(firstBytes);
    
    if (!header.startsWith('%PDF-')) {
      return {
        isValid: false,
        error: "Invalid PDF format"
      };
    }

    // Estimate word count
    // const content = new Uint8Array(arrayBuffer);
    // const text = new TextDecoder().decode(content);
    // const wordCount = text.split(/\s+/).length;

    // if (wordCount > maxWordCount) {
    //   return {
    //     isValid: false,
    //     error: `PDF contains too many words (${wordCount}). Limit is ${maxWordCount}.`
    //   };
    // }

    return {
      isValid: true,
    //   wordCount,
      file
    };
  } catch (err) {
    console.error("Error reading the PDF:", err);
    return {
      isValid: false,
      error: "Error reading the PDF. Try another file."
    };
  }
};