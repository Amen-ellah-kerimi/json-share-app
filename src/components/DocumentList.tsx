'use client'

import { JsonDocument } from '@prisma/client'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

interface DocumentListProps {
  documents: JsonDocument[]
  onDelete: (id: string) => Promise<void>
}

export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Failed to delete document. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const copyShareLink = async (slug: string) => {
    const shareUrl = `${window.location.origin}/share/${slug}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please try again.')
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-4">Create your first JSON document to get started!</p>
          <Link href="/new" className="btn-primary">
            Create Document
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                <Link
                  href={`/edit/${doc.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {doc.title}
                </Link>
              </h3>
              <p className="text-sm text-gray-500">
                Created {formatDate(doc.createdAt)}
                {doc.updatedAt > doc.createdAt && (
                  <span> • Updated {formatDate(doc.updatedAt)}</span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyShareLink(doc.slug)}
                className="btn-secondary text-xs"
                title="Copy share link"
              >
                Share
              </button>
              <Link
                href={`/edit/${doc.id}`}
                className="btn-secondary text-xs"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(doc.id, doc.title)}
                disabled={deletingId === doc.id}
                className="btn-danger text-xs"
              >
                {deletingId === doc.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded p-3">
            <pre className="text-xs text-gray-600 overflow-x-auto max-h-32 overflow-y-auto">
              {doc.content.length > 200 
                ? `${doc.content.substring(0, 200)}...` 
                : doc.content
              }
            </pre>
          </div>
        </div>
      ))}
    </div>
  )
}
