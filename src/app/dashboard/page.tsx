export const dynamic = "force-dynamic";
import { getUserDocuments, deleteJsonDocument } from '@/lib/actions'
import Navigation from '@/components/Navigation'
import DocumentList from '@/components/DocumentList'
import Link from 'next/link'
import { JsonDocument } from '@prisma/client'
import "../globals.css";

export default async function DashboardPage() {
  let documents: JsonDocument[] = []
  let error: string | null = null

  try {
    documents = await getUserDocuments()
  } catch (err) {
    console.error('Error loading documents:', err)
    error = err instanceof Error ? err.message : 'Failed to load documents'
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600 mt-2">
              Manage your JSON documents and share them with others
            </p>
          </div>
          <Link href="/new" className="btn-primary">
            New Document
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading documents</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onDelete={async (id: string) => {
              'use server'
              await deleteJsonDocument(id)
            }}
          />
        )}
      </div>
    </>
  )
}
