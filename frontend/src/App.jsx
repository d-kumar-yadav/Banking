import { Route, Routes, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import { useState, useEffect } from "react"
import { Toaster } from 'react-hot-toast'
import axios from "axios"
import Private_user from "./components/PrivateRoute_user"
import Loader from "./components/Loader"

axios.defaults.withCredentials = true; 

function App() {
  const [islogin, setislogin] = useState(false);

  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const verifySession = async () => {
      try {
        // here browser automatticalu send toekn in cookies
        const response = await axios.get("http://localhost:4000/api/auth/verify");
        if (response.data.success) {
          setislogin(true);
        } else {
          setislogin(false);
        }
      } catch (error) {
        // If the token is invalid/expired, log them out
        setislogin(false);
      } finally {
        setIsLoading(false); // Stop the loading screen
      }
    };
    verifySession();
  }, []);  // This runs once on app load 

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader text="Loading" />
      </div>
    );
  }

  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e1b4b',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.15)',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid #c7d2fe',
            letterSpacing: '0.02em',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={islogin ? <Navigate to="/Dashboard" replace /> : <Home />}></Route>
        <Route path="/Login" element={islogin ? <Navigate to="/Dashboard" replace /> : <Login setislogin={setislogin} />}></Route>
        <Route path="/Signup" element={islogin ? <Navigate to="/Dashboard" replace /> : <Signup setislogin={setislogin} />}></Route>

        <Route path="/Dashboard/*" element={
          <Private_user islogin={islogin}>
            <Dashboard setislogin={setislogin} />
          </Private_user>
        }></Route>
      </Routes>
    </div>
  )
}

export default App
