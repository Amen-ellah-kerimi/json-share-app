/**
 * API Client for handling all API requests
 * Automatically handles production vs development URLs
 */

// Get the base URL for API requests
function getBaseUrl(): string {
  // In browser, use relative URLs
  if (typeof window !== 'undefined') {
    return ''
  }
  
  // On server, use the full URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Fallback for development
  return 'http://localhost:3000'
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  details?: unknown[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = getBaseUrl()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorData: ApiResponse
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status,
          errorData.details
        )
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error - please check your connection', 0)
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      )
    }
  }

  // Document API methods
  async getDocuments() {
    return this.request<unknown[]>('/api/documents')
  }

  async createDocument(data: { title: string; content: string }) {
    return this.request<unknown>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getDocument(id: string) {
    return this.request<unknown>(`/api/documents/${id}`)
  }

  async updateDocument(id: string, data: { title?: string; content?: string }) {
    return this.request<unknown>(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDocument(id: string) {
    return this.request<unknown>(`/api/documents/${id}`, {
      method: 'DELETE',
    })
  }

  // Health check
  async healthCheck() {
    return this.request<unknown>('/api/health')
  }

  // Public document access
  async getPublicDocument(slug: string) {
    return this.request<unknown>(`/api/documents/public/${slug}`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Utility function for handling API errors in components
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// Hook for API calls with error handling
export function useApiCall() {
  const callApi = async <T>(
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> => {
    try {
      const result = await apiCall()
      onSuccess?.(result)
      return result
    } catch (error) {
      const errorMessage = handleApiError(error)
      onError?.(errorMessage)
      return null
    }
  }

  return { callApi }
}
