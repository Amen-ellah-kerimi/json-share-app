import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import "./globals.css";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            JSON Share App
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Create, edit, and share JSON documents with ease. Built with Next.js 14, 
            Clerk authentication, and Prisma ORM.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <SignedIn>
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                Go to Dashboard
              </Link>
              <Link href="/new" className="btn-secondary text-lg px-8 py-3">
                Create Document
              </Link>
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary text-lg px-8 py-3">
                  Get Started
                </button>
              </SignInButton>
              <Link href="#features" className="btn-secondary text-lg px-8 py-3">
                Learn More
              </Link>
            </SignedOut>
          </div>
        </div>

        <div id="features" className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy JSON Editing
              </h3>
              <p className="text-gray-600">
                Create and edit JSON documents with syntax validation and formatting tools.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Public Sharing
              </h3>
              <p className="text-gray-600">
                Share your JSON documents with others via unique, read-only links.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your documents are private by default with secure authentication via Clerk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
