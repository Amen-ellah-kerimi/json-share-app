import { getUserDocuments, deleteJsonDocument } from '@/lib/actions'
import Navigation from '@/components/Navigation'
import DocumentList from '@/components/DocumentList'
import Link from 'next/link'
import "../globals.css";

export default async function DashboardPage() {
  const documents = await getUserDocuments()

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

        <DocumentList 
          documents={documents} 
          onDelete={async (id: string) => {
            'use server'
            await deleteJsonDocument(id)
          }}
        />
      </div>
    </>
  )
}
