'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'
import { createJsonDocumentSchema, updateJsonDocumentSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJsonDocument(formData: FormData) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const validatedData = createJsonDocumentSchema.parse({ title, content })

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

  revalidatePath('/dashboard')
  redirect(`/edit/${document.id}`)
}

export async function updateJsonDocument(id: string, formData: FormData) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const validatedData = updateJsonDocumentSchema.parse({ title, content })

  // Verify ownership
  const existingDoc = await db.jsonDocument.findFirst({
    where: { id, userId },
  })

  if (!existingDoc) {
    throw new Error('Document not found or unauthorized')
  }

  await db.jsonDocument.update({
    where: { id },
    data: validatedData,
  })

  revalidatePath('/dashboard')
  revalidatePath(`/edit/${id}`)
}

export async function deleteJsonDocument(id: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const existingDoc = await db.jsonDocument.findFirst({
    where: { id, userId },
  })

  if (!existingDoc) {
    throw new Error('Document not found or unauthorized')
  }

  await db.jsonDocument.delete({
    where: { id },
  })

  revalidatePath('/dashboard')
}

export async function getUserDocuments() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  return await db.jsonDocument.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getDocumentById(id: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const document = await db.jsonDocument.findFirst({
    where: { id, userId },
  })

  if (!document) {
    throw new Error('Document not found or unauthorized')
  }

  return document
}

export async function getPublicDocument(slug: string) {
  const document = await db.jsonDocument.findUnique({
    where: { slug },
    include: { user: true },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  return document
}
