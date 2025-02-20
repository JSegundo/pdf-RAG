'use client'
import PDFDropzone from "./components/PDFDropzone"

export default function Home() {
  console.log('asdasd')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <h1 className="mb-8 text-4xl font-bold text-gray-800">PDF Uploader 2 </h1>
      <PDFDropzone />
    </main>
  )
}

