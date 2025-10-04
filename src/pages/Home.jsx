import { useAuth } from '../context/AuthContext'
import { getUserInfo } from '../utils/auth'

function Home() {
  const { isAuthenticated } = useAuth()
  const userInfo = isAuthenticated ? getUserInfo() : null

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>

      {isAuthenticated && userInfo && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>User Information</h3>
          <div style={{ marginTop: '15px' }}>
            {userInfo.name && <p><strong>Name:</strong> {userInfo.name}</p>}
            {userInfo.preferred_username && <p><strong>Username:</strong> {userInfo.preferred_username}</p>}
            {userInfo.email && <p><strong>Email:</strong> {userInfo.email}</p>}
            {userInfo.sub && <p><strong>Subject:</strong> {userInfo.sub}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
