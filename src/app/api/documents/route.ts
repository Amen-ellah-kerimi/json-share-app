import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'
import { createJsonDocumentSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  let userId: string | null = null
  try {
    const authResult = await auth()
    userId = authResult.userId

    logger.apiRequest('GET', '/api/documents', userId || undefined)

    if (!userId) {
      logger.warn('Unauthorized access attempt to GET /api/documents')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documents = await db.jsonDocument.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    logger.userAction('fetch_documents', userId, { count: documents.length })
    return NextResponse.json(documents)
  } catch (error) {
    logger.apiError('GET', '/api/documents', error as Error, userId || undefined)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let userId: string | null = null
  try {
    const authResult = await auth()
    userId = authResult.userId

    logger.apiRequest('POST', '/api/documents', userId || undefined)

    if (!userId) {
      logger.warn('Unauthorized access attempt to POST /api/documents')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request data with better error handling
    const validationResult = createJsonDocumentSchema.safeParse(body)
    if (!validationResult.success) {
      logger.warn('Validation failed for document creation', {
        userId,
        errors: validationResult.error.errors
      })
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Ensure user exists in database
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: null, // Will be updated by webhook
      },
    })

    const document = await db.jsonDocument.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        slug: generateSlug(),
        userId,
      },
    })

    logger.userAction('create_document', userId, {
      documentId: document.id,
      title: document.title
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    logger.apiError('POST', '/api/documents', error as Error, userId || undefined)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A document with this slug already exists' },
          { status: 409 }
        )
      }

      // Handle database connection errors
      if (error.message.includes('Can\'t reach database server') ||
          error.message.includes('Connection refused') ||
          error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 503 }
        )
      }

      // Handle authentication errors
      if (error.message.includes('Authentication failed')) {
        return NextResponse.json(
          { error: 'Database authentication failed' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
