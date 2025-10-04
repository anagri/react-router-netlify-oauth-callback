import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserInfo } from '../utils/auth'
import './Header.css'

function Header() {
  const { isAuthenticated, login, logout } = useAuth()
  const userInfo = isAuthenticated ? getUserInfo() : null

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left"></div>

        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>

        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-section">
              <span className="user-email">{userInfo?.email || userInfo?.preferred_username || 'User'}</span>
              <button onClick={logout} className="logout-button">Logout</button>
            </div>
          ) : (
            <button onClick={login} className="login-button">Login</button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
