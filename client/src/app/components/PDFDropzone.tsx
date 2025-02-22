"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FileIcon, UploadIcon } from "lucide-react"
import React from "react"
import { validatePDF } from "../utils/pdfUtils"

interface UploadResponse {
  jobId: string;
  message: string;
  originalName: string;
}

export default function PDFDropzone() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    console.log("File state updated:", file)
  }, [file])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    // Reset previous state
    setError("")
    setFile(null)
    setJobId(null)

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

  const uploadFile = async () => {
    if (!file) return;

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:3000/api/document/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const data: UploadResponse = await response.json()
      setJobId(data.jobId)
      console.log('Upload successful:', data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

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
            onClick={() => {
              setFile(null)
              setJobId(null)
              setError("")
            }}
            className="mt-4 w-full rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Clear
          </button>
          <button
            onClick={uploadFile}
            disabled={isUploading}
            className={`mt-4 w-full rounded px-4 py-2 text-white transition-colors ${
              isUploading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload PDF"}
          </button>
        </>
      )}

      {jobId && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 text-sm">
            File uploaded successfully! Job ID: {jobId}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
