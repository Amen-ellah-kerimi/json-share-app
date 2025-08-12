import { JsonDocument, User } from '@prisma/client'

export type JsonDocumentWithUser = JsonDocument & {
  user: User
}

export type CreateJsonDocumentData = {
  title: string
  content: string
}

export type UpdateJsonDocumentData = {
  title?: string
  content?: string
}

export type JsonDocumentFormData = {
  title: string
  content: string
}
