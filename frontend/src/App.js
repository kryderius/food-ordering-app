import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
// import jwt from 'jsonwebtoken';

function App() {
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const jwttoken = localStorage.getItem('token');

    axios
      .get('http://localhost:5000/api/user', {
        headers: { Authorization: `Bearer ${jwttoken}` },
      })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUserData(null);
  };

  // function checkAuth() {
  //   try {
  //     const decoded = jwt.verify(token, 'your_secret_key');
  //     console.log(decoded);
  //     return true;
  //   } catch (error) {
  //     return false;
  //   }
  // }

  return (
    <div className='App'>
      {!userData ? (
        <Login />
      ) : (
        <Dashboard userData={userData.user} logout={logout} />
      )}
    </div>
  );
}

export default App;

