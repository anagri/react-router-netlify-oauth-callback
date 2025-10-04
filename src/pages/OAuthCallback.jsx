import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { handleCallback } from '../utils/auth'
import { useAuth } from '../context/AuthContext'

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { updateAuthState } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError(`OAuth error: ${errorParam}`)
        setLoading(false)
        return
      }

      if (!code || !state) {
        setError('Missing code or state parameter')
        setLoading(false)
        return
      }

      try {
        await handleCallback(code, state)
        updateAuthState()
        navigate('/', { replace: true })
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    processCallback()
  }, [searchParams, navigate, updateAuthState])

  if (loading) {
    return (
      <div>
        <h2>Processing login...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    )
  }

  return null
}

export default OAuthCallback
