'use client'

import { useState, useEffect } from 'react'
import { formatJSON, isValidJSON } from '@/lib/utils'

interface JsonEditorProps {
  initialTitle?: string
  initialContent?: string
  onSave: (data: { title: string; content: string }) => Promise<void>
  isLoading?: boolean
  readOnly?: boolean
}

export default function JsonEditor({
  initialTitle = '',
  initialContent = '{\n  "example": "value"\n}',
  onSave,
  isLoading = false,
  readOnly = false,
}: JsonEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [isValidJson, setIsValidJson] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const valid = isValidJSON(content)
    setIsValidJson(valid)
    if (!valid && content.trim()) {
      setError('Invalid JSON format')
    } else {
      setError('')
    }
  }, [content])

  const handleFormat = () => {
    if (isValidJson) {
      setContent(formatJSON(content))
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!isValidJson) {
      setError('Please fix JSON format before saving')
      return
    }

    try {
      await onSave({ title: title.trim(), content })
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Document Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title..."
          className="input"
          disabled={readOnly}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            JSON Content
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleFormat}
              disabled={!isValidJson}
              className="btn-secondary text-xs"
            >
              Format JSON
            </button>
          )}
        </div>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your JSON here..."
          className={`textarea min-h-[400px] font-mono text-sm ${
            !isValidJson ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          disabled={readOnly}
        />
        {!isValidJson && (
          <p className="text-red-500 text-sm mt-1">Invalid JSON format</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading || !isValidJson || !title.trim()}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Document'}
          </button>
        </div>
      )}
    </div>
  )
}
