import { getPublicDocument } from '@/lib/actions'
import { formatDate } from '@/lib/utils'
import JsonEditor from '@/components/JsonEditor'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import "../../globals.css";

interface SharePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SharePage({ params }: SharePageProps) {
  try {
    const resolvedParams = await params
    const document = await getPublicDocument(resolvedParams.slug)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-gray-900">
                JSON Share
              </Link>
              <div className="text-sm text-gray-500">
                Read-only view
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {document.title}
            </h1>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Created {formatDate(document.createdAt)}</p>
              {document.updatedAt > document.createdAt && (
                <p>Last updated {formatDate(document.updatedAt)}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <JsonEditor
              initialTitle={document.title}
              initialContent={document.content}
              onSave={async () => {}} // No-op for read-only
              readOnly={true}
            />
          </div>

          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                This is a read-only view of a shared JSON document.{' '}
                <Link href="/" className="font-medium underline">
                  Create your own
                </Link>{' '}
                to start editing and sharing JSON documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading shared document:', error)
    notFound()
  }
}

export async function generateMetadata({ params }: SharePageProps) {
  try {
    const resolvedParams = await params
    const document = await getPublicDocument(resolvedParams.slug)
    return {
      title: `${document.title} - JSON Share`,
      description: `View shared JSON document: ${document.title}`,
    }
  } catch {
    return {
      title: 'Document Not Found - JSON Share',
      description: 'The requested JSON document could not be found.',
    }
  }
}
