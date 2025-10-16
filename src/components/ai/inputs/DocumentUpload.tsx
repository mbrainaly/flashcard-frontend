import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import FeatureGate from '@/components/features/FeatureGate'

interface DocumentUploadProps {
  onDocumentSubmit: (file: File) => void;
}

export default function DocumentUpload({ onDocumentSubmit }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile)
      onDocumentSubmit(droppedFile); // Trigger analysis
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile)
      onDocumentSubmit(selectedFile); // Trigger analysis
    }
  }

  const isValidFileType = (file: File) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    return allowedTypes.includes(file.type)
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <FeatureGate featureKey="document_upload">
      <div className="h-full">
      {!file ? (
        <motion.div
          className={`h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${
            isDragging ? 'border-accent-neon bg-accent-neon/5' : 'border-accent-silver/30'
          } p-6 transition-colors`}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <DocumentIcon className="h-12 w-12 text-accent-silver" />
          <p className="mt-4 text-center text-sm text-accent-silver">
            <span className="font-semibold text-accent-neon">
              Click to upload
            </span>{' '}
            or drag and drop
          </p>
          <p className="mt-1 text-xs text-accent-silver">
            PDF, DOC, DOCX, or TXT (max 10MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            aria-label="Upload document"
          />
        </motion.div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="relative rounded-lg bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <DocumentIcon className="h-8 w-8 text-accent-neon" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-accent-silver">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <motion.button
              onClick={removeFile}
              className="absolute -top-2 -right-2 rounded-full bg-accent-obsidian p-1 text-accent-silver hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      )}
      </div>
    </FeatureGate>
  )
} 