import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Wysyłanie danych logowania do API
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      // Przetwarzanie odpowiedzi z API
      if (response.data.token) {
        // Przechowywanie tokenu JWT w przeglądarce
        localStorage.setItem('token', response.data.token);

        // Przekierowanie do strony głównej
        window.location.href = '/';
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <label>
        Adres email:
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <br />
      <label>
        Hasło:
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button type='submit'>Zaloguj</button>
    </form>
  );
};

export default Login;
