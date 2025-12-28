import axios from 'axios'

function normalize(url) {
  if (!url) return ''
  return url.replace(/\/$/, '')
}

const storedUrl = normalize(localStorage.getItem('ancs_api_url'))
const envUrl = normalize(import.meta.env.VITE_API_URL)
const baseURL = storedUrl || envUrl || 'http://localhost:8000/api'

if (!storedUrl && !envUrl) {
  // Helpful hint in console to configure API endpoint on GH Pages.
  // Example: localStorage.setItem('ancs_api_url', 'https://your-backend.example.com/api')
  console.warn('ANCS: API URL not configured. Set localStorage ancs_api_url to your backend, e.g., https://your-backend.example.com/api')
}

const api = axios.create({
  baseURL
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ancs_token')
      localStorage.removeItem('ancs_user')
    }
    return Promise.reject(error)
  }
)

export default api
