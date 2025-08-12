import { z } from 'zod'

export const createJsonDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required').refine((val) => {
    try {
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, 'Content must be valid JSON')
})

export const updateJsonDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  content: z.string().min(1, 'Content is required').refine((val) => {
    try {
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, 'Content must be valid JSON').optional()
})

export type CreateJsonDocumentInput = z.infer<typeof createJsonDocumentSchema>
export type UpdateJsonDocumentInput = z.infer<typeof updateJsonDocumentSchema>
