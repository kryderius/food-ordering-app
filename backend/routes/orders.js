import { Router } from 'express';
import connection from '../config/Database.js';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

connection.connect();
const io = new Server();

const orders = Router();
orders.use(bodyParser.json());

orders.post('/api/addorder', (req, res) => {
  const { paymentMethod, orderContent, tableNumber, status, dish_details } =
    req.body;
  const orderId = uuidv4();

  const insertOrderQuery =
    'INSERT INTO orders (id, payment_method, order_content, table_number, status) VALUES (?, ?, ?, ?, ?)';
  connection.query(
    insertOrderQuery,
    [orderId, paymentMethod, orderContent, tableNumber, status],
    (error) => {
      if (error) {
        return res.status(500).json({ error });
      }

      // return res.status(201).json({ message: 'Pomyslnie dodano produkty.' });

      const dishes = dish_details.map((dish) => [
        orderId,
        dish.dish_name,
        dish.dish_price,
        dish.quantity,
      ]);

      connection.query(
        'INSERT INTO order_details (id, dish_name, dish_price, quantity) VALUES ?',
        [dishes],
        (error) => {
          if (error) {
            return res.status(500).json({ error });
          }

          io.emit('new_order', {
            id: orderId,
            payment_method: paymentMethod,
            order_details: dish_details,
            status: status,
          });

          return res.status(201).json({
            message: 'Pomyslnie dodano produkty do tabeli order_details.',
          });
        }
      );
    }
  );
});

// orders.get('/api/getorders', (req, res) => {
//   const { authorization } = req.headers;

//   if (!authorization) {
//     return res.status(401).json({ message: 'Token nie został przesłany.' });
//   }

//   // Pobieranie tokenu z nagłówka
//   const token = authorization.split(' ')[1];

//   try {
//     // Weryfikacja tokenu
//     const decoded = jwt.verify(token, 'your_secret_key');
//     const userId = decoded.userId;

//     // Pobieranie danych użytkownika z bazy danych
//     const getOrdersQuery = 'SELECT * FROM orders';
//     connection.query(getOrdersQuery, (error, results) => {
//       if (error) {
//         return res.status(500).json({ error });
//       }

//       if (results.length === 0) {
//         return res
//           .status(404)
//           .json({ message: 'Nie znaleziono użytkownika o podanym ID.' });
//       }

//       const user = results.map((result) => result);

//       return res.status(200).json({ user });
//     });
//   } catch (error) {
//     return res
//       .status(401)
//       .json({ message: 'Nieprawidłowy lub nieaktualny token.' });
//   }
// });

orders.get('/api/getorders', (req, res) => {
  const { authorization } = req.headers;
  const { orderID } = req.body;

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
    const getOrdersQuery =
      'SELECT order_details.id, order_details.dish_name, order_details.dish_price, order_details.quantity, orders.table_number FROM order_details JOIN orders ON order_details.id = orders.id WHERE order_details.id = ?';
    connection.query(getOrdersQuery, [orderID], (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: 'Nie znaleziono użytkownika o podanym ID.' });
      }

      const user = results.map((result) => result);

      return res.status(200).json({ user });
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Nieprawidłowy lub nieaktualny token.' });
  }
});

orders.get('/api/getallorders', (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token nie został przesłany.' });
  }

  // Pobieranie tokenu z nagłówka
  const token = authorization.split(' ')[1];

  try {
    // Weryfikacja tokenu
    const decoded = jwt.verify(token, 'your_secret_key');

    // Pobieranie danych użytkownika z bazy danych
    const getOrdersQuery =
      'SELECT * FROM orders JOIN order_details ON orders.id = order_details.id';
    connection.query(getOrdersQuery, (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: 'Nie znaleziono żadnych zamówień.' });
      }
      const orders = results.reduce((acc, order) => {
        if (!acc[order.id]) {
          acc[order.id] = {
            order_id: order.id,
            order_paymentMethod: order.payment_method,
            order_date: order.date,
            order_table: order.table_number,
            dish_details: [],
          };
        }
        acc[order.id].dish_details.push({
          dish_name: order.dish_name,
          dish_price: order.dish_price,
          dish_quantity: order.quantity,
        });
        return acc;
      }, {});
      res.send(Object.values(orders));
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Nieprawidłowy lub nieaktualny token.' });
  }
});

export { orders, io };
