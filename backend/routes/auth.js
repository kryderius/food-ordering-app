import { Router } from 'express';
import connection from '../config/Database.js';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const auth = Router();
auth.use(bodyParser.json());

auth.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  const userId = uuidv4();

  // Sprawdzanie, czy podany email już istnieje w bazie danych
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkEmailQuery, [email], (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }

    if (results.length > 0) {
      return res
        .status(409)
        .json({ message: 'Podany adres email już istnieje.' });
    }

    // Hashowanie hasła
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Dodawanie użytkownika do bazy danych
    const insertUserQuery =
      'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)';
    connection.query(
      insertUserQuery,
      [userId, email, username, hashedPassword],
      (error) => {
        if (error) {
          return res.status(500).json({ error });
        }

        return res
          .status(201)
          .json({ message: 'Rejestracja zakończyła się powodzeniem.' });
      }
    );
  });
});

auth.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Pobieranie użytkownika z bazy danych po podanym adresie email
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(getUserQuery, [email], async (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Nie znaleziono użytkownika o podanym adresie email.',
      });
    }

    const user = results[0];

    // Porównywanie podanego hasła z zahashowanym hasłem użytkownika
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Nieprawidłowe hasło.' });
    }

    // Tworzenie tokenu JWT z informacjami o użytkowniku
    const token = jwt.sign({ userId: user.id }, 'your_secret_key', {
      expiresIn: '1h',
    });

    return res
      .status(200)
      .json({ message: 'Logowanie zakończyło się powodzeniem.', token });
  });
});

auth.get('/api/user', (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token nie został przesłany.' });
  }

  // Pobieranie tokenu z nagłówka
  const token = authorization.split(' ')[1];

  try {
    // Weryfikacja tokenu
    const decoded = jwt.verify(token, 'your_secret_key');
    const userId = decoded.userId;

    // Pobieranie danych użytkownika z bazy danych
    const getUserQuery = 'SELECT * FROM users WHERE id = ?';
    connection.query(getUserQuery, [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: 'Nie znaleziono użytkownika o podanym ID.' });
      }

      const user = results[0];

      return res.status(200).json({ user });
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Nieprawidłowy lub nieaktualny token.' });
  }
});

export default auth;
