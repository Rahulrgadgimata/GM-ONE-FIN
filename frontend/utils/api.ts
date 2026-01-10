const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface ApiResponse<T = any> {
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('token')

    const headers: any = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    // Only set Content-Type if not already set (for FormData)
    if (!options.headers || !(options.headers as any)['Content-Type']) {
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }
    }

    const config: RequestInit = {
      headers,
      ...options,
    }

    console.log('API Request to:', url, 'Token present:', !!token)
    try {
      console.log(`Making request to: ${url}`)
      const response = await fetch(url, config)
      console.log(`Response status: ${response.status}`)
      
      // Handle non-JSON responses
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        return { error: text || 'Server returned non-JSON response' }
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return { error: 'Unauthorized - Please login again' }
        }
        if (response.status === 422) {
          // Check if it's a token format error
          if (data.code === 'INVALID_TOKEN_FORMAT' || (data.error && data.error.includes('Token format'))) {
            console.error('Invalid token format detected - clearing tokens')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Redirect to login with message
            window.location.href = '/login?error=invalid_token'
            return { error: 'Token format is invalid. Please login again.' }
          }
        }
        // Return more specific error messages
        const errorMessage = data.error || data.message || `Server error (${response.status})`
        console.error('API Error:', errorMessage, 'Full response:', data)
        return { error: errorMessage }
      }

      // Return the data directly if it's already the response object
      return { data: data }
    } catch (error: any) {
      console.error('Network error:', error)
      console.error('Request URL:', url)
      console.error('Error details:', error)
      
      // More specific error messages
      if (error.message === 'Failed to fetch') {
        return { 
          error: 'Cannot connect to server. Please ensure the backend is running on http://localhost:5000' 
        }
      }
      return { error: error.message || 'Network error - Please check your connection' }
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, options)
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

const api = new ApiClient(API_BASE_URL)

export default api