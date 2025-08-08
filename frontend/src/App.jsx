import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminHomepage from './admin/AdminHomepage';
import WorkerHomepage from './worker/WorkerHomepage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  // Function to get page from URL
  const getPageFromPath = (path) => {
    if (path === '/signup') return 'signup';
    if (path === '/admin') return 'admin';
    if (path === '/worker') return 'worker';
    return 'login';
  };

  // Function to navigate to a page
  const navigateToPage = (page) => {
    const path = page === 'login' ? '/login' : `/${page}`;
    window.history.pushState({}, '', path);
    setCurrentPage(page);
  };

  useEffect(() => {
    // Check for existing user session
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Route to appropriate homepage based on role
      if (parsedUser.role === 'admin') {
        navigateToPage('admin');
      } else if (parsedUser.role === 'worker') {
        navigateToPage('worker');
      }
    } else {
      // Route based on current URL path
      const initialPage = getPageFromPath(window.location.pathname);
      setCurrentPage(initialPage);
    }

    // Handle browser navigation (back/forward buttons)
    const handlePopState = () => {
      const newPage = getPageFromPath(window.location.pathname);
      setCurrentPage(newPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Make navigation function available globally
  useEffect(() => {
    window.navigateToPage = navigateToPage;
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'signup':
        return <Signup />;
      case 'admin':
        return <AdminHomepage />;
      case 'worker':
        return <WorkerHomepage />;
      default:
        return <Login />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
