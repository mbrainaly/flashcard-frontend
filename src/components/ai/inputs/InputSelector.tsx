import { useState } from 'react'
import TabSelector, { InputTab } from './TabSelector'
import TextInput from './TextInput'
import DocumentUpload from './DocumentUpload'
import URLInput from './URLInput'

interface InputSelectorProps {
  onTextSubmit: (text: string) => void
  onDocumentSubmit: (file: File) => void
  onURLSubmit: (url: string) => void
}

export default function InputSelector({
  onTextSubmit,
  onDocumentSubmit,
  onURLSubmit,
}: InputSelectorProps) {
  const [activeTab, setActiveTab] = useState<InputTab>('text')

  return (
    <div className="space-y-4">
      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="h-[300px]">
        {activeTab === 'text' && (
          <TextInput onChange={onTextSubmit} />
        )}
        
        {activeTab === 'document' && (
          <DocumentUpload onSubmit={onDocumentSubmit} />
        )}
        
        {activeTab === 'url' && (
          <URLInput onSubmit={onURLSubmit} />
        )}
      </div>
    </div>
  )
} 