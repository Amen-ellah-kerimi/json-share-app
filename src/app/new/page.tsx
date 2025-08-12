'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import JsonEditor from '@/components/JsonEditor'
import "../globals.css";

export default function NewDocumentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async (data: { title: string; content: string }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create document')
      }

      const document = await response.json()
      router.push(`/edit/${document.id}`)
    } catch (error) {
      console.error('Error creating document:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Document</h1>
          <p className="text-gray-600 mt-2">
            Create a new JSON document that you can edit and share
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <JsonEditor onSave={handleSave} isLoading={isLoading} />
        </div>
      </div>
    </>
  )
}
