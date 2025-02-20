"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FileIcon, UploadIcon } from "lucide-react"
import React from "react"
import { validatePDF } from "../utils/pdfUtils"

export default function PDFDropzone() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    console.log("File state updated:", file)
  }, [file])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    // Reset previous state
    setError("")
    setFile(null)

    // Validate the PDF
    const validationResult = await validatePDF(selectedFile, {
      maxSizeInMB: 5,
      maxWordCount: 1
    })

    if (validationResult.isValid) {
      setFile(selectedFile)
    } else {
      setError(validationResult.error || "Invalid PDF file")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  })

  return (
    <div className="w-full max-w-md">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center">
            <FileIcon className="mb-2 h-12 w-12 text-blue-500" />
            <p className="text-center text-sm text-gray-600">{file.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadIcon className="mb-2 h-12 w-12 text-gray-400" />
            <p className="text-center text-sm text-gray-600">
              {isDragActive
                ? "Drop the PDF here"
                : "Drag & drop a PDF file here, or click to select"}
            </p>
          </div>
        )}
      </div>
      
      {file && (
        <>
        <button
          onClick={() => setFile(null)}
          className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
          Clear
        </button>
        <button
          onClick={() => alert('asdasd')}
          className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
          Get summary
        </button>
          </>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
// "use client"

// import { useCallback, useEffect, useState } from "react"
// import { useDropzone } from "react-dropzone"
// import { FileIcon, UploadIcon } from "lucide-react"
// import React from "react"
// import pdfParse from "pdf-parse"; // Import pdf-parse for client-side check

// export default function PDFDropzone() {
//   const [file , setFile] = useState<File | null>()
//   const [text, setText] = useState("");
//   const [error, setError] = useState("");

// useEffect(() => {
//   console.log("File state updated:", file);
// }, [file]); // This will log when the file state changes


// const onDrop = useCallback(async (acceptedFiles: File[]) => {
//   console.log('asca')
//   const selectedFile = acceptedFiles[0];

//   if (!selectedFile) return;

//   // Reset previous errors
//   setError("");
//   setText("");

//   // 1️⃣ Check file type
//   if (selectedFile.type !== "application/pdf") {
//     setError("Only PDF files are allowed.");
//     return;
//   }

//   // 2️⃣ Check file size
//   if (selectedFile.size > MAX_FILE_SIZE) {
//     setError("File size must be less than 5MB.");
//     return;
//   }

//   // 3️⃣ Read and check word count using pdf-parse (Client-Side)
//   try {
//     const arrayBuffer = await selectedFile.arrayBuffer();
//     const pdfData = await pdfParse(Buffer.from(arrayBuffer));
//     const wordCount = pdfData.text.split(/\s+/).length;

//     if (wordCount > MAX_WORD_COUNT) {
//       setError(`PDF contains too many words (${wordCount}). Limit is ${MAX_WORD_COUNT}.`);
//       return;
//     }

//     setFile(selectedFile);
//   } catch (err) {
//     console.error(err);
//     setError("Error reading the PDF. Try another file.");
//   }
// }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: { "application/pdf": [".pdf"] },
//     multiple: false,
//   })
// console.log('asdasd')


//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
//   const MAX_WORD_COUNT = 5000; // Adjust as needed

//   return (
//     <div className="w-full max-w-md">
//       <div
//         {...getRootProps()}
//         className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
//           isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"}`}>
//         <input {...getInputProps()}  />
//         {file ? (
//           <div className="flex flex-col items-center">
//             <FileIcon className="mb-2 h-12 w-12 text-blue-500" />
//             <p className="text-center text-sm text-gray-600">{file?.name}</p>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center">
//             <UploadIcon className="mb-2 h-12 w-12 text-gray-400" />
//             <p className="text-center text-sm text-gray-600">
//               {isDragActive ? "Drop the PDF here" : "Drag & drop a PDF file here, or click to select"}
//             </p>
//           </div>
//         )}
//       </div>
//       {file && (
//         <button
//           onClick={() => {setFile(null)}}
//           className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
//         >
//           Clear
//         </button>
//       )}

//       {error && <p>{error}</p>}
//       {text && <p>{text}</p>}
//     </div>
//   )
// }
