'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import JsonEditor from '@/components/JsonEditor'
import { JsonDocument } from '@prisma/client'
import "../../globals.css"

export default function EditDocumentPage() {
  const [document, setDocument] = useState<JsonDocument | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDoc, setIsLoadingDoc] = useState(true)
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/dashboard')
            return
          }
          throw new Error('Failed to fetch document')
        }
        const doc = await response.json()
        setDocument(doc)
      } catch (error) {
        console.error('Error fetching document:', error)
        router.push('/dashboard')
      } finally {
        setIsLoadingDoc(false)
      }
    }

    fetchDocument()
  }, [documentId, router])

  const handleSave = async (data: { title: string; content: string }) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update document')
      }

      const updatedDoc = await response.json()
      setDocument(updatedDoc)
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const copyShareLink = async () => {
    if (!document) return
    
    const shareUrl = `${window.location.origin}/share/${document.slug}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please try again.')
    }
  }

  if (isLoadingDoc) {
    return (
      <>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading document...</div>
        </div>
      </>
    )
  }

  if (!document) {
    return (
      <>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Document not found</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Document</h1>
            <p className="text-gray-600 mt-2">
              Make changes to your JSON document
            </p>
          </div>
          <button
            onClick={copyShareLink}
            className="btn-secondary"
          >
            Copy Share Link
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <JsonEditor
            initialTitle={document.title}
            initialContent={document.content}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  )
}
