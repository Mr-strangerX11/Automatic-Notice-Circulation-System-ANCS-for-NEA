import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
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
