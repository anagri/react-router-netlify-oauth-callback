const KEYCLOAK_SERVER = import.meta.env.VITE_KEYCLOAK_SERVER
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM
const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID

const getAuthorizationEndpoint = () => {
  return `${KEYCLOAK_SERVER}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`
}

const getTokenEndpoint = () => {
  return `${KEYCLOAK_SERVER}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`
}

const getRedirectUri = () => {
  if (import.meta.env.MODE === 'production') {
    return 'https://coruscating-liger-22d87a.netlify.app/oauth/callback'
  }
  return 'http://localhost:5173/oauth/callback'
}

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64urlencode = (buffer) => {
  const str = String.fromCharCode.apply(null, new Uint8Array(buffer))
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export const initiateLogin = async () => {
  const codeVerifier = generateRandomString(64)
  sessionStorage.setItem('code_verifier', codeVerifier)

  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64urlencode(hashed)

  const state = generateRandomString(16)
  sessionStorage.setItem('oauth_state', state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })

  window.location.href = `${getAuthorizationEndpoint()}?${params.toString()}`
}

export const handleCallback = async (code, state) => {
  const storedState = sessionStorage.getItem('oauth_state')

  if (state !== storedState) {
    throw new Error('Invalid state parameter')
  }

  const codeVerifier = sessionStorage.getItem('code_verifier')

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: getRedirectUri(),
    client_id: CLIENT_ID,
    code_verifier: codeVerifier
  })

  const response = await fetch(getTokenEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: tokenParams.toString()
  })

  if (!response.ok) {
    throw new Error('Token exchange failed')
  }

  const tokens = await response.json()

  localStorage.setItem('access_token', tokens.access_token)
  if (tokens.refresh_token) {
    localStorage.setItem('refresh_token', tokens.refresh_token)
  }

  sessionStorage.removeItem('code_verifier')
  sessionStorage.removeItem('oauth_state')

  return tokens
}

export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export const getAccessToken = () => {
  return localStorage.getItem('access_token')
}

export const isAuthenticated = () => {
  return !!getAccessToken()
}

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const getUserInfo = () => {
  const token = getAccessToken()
  if (!token) {
    return null
  }
  return decodeJWT(token)
}
