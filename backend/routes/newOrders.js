const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
});

router.post('/', (req, res) => {
  const { order_total, customer_name, dish_details } = req.body;

  connection.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .send({ error: 'Error while beginning transaction.' });
    }
    connection.query(
      'INSERT INTO orders (order_total, customer_name) VALUES (?, ?)',
      [order_total, customer_name],
      (err, results) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).send({ error: 'Error while adding order.' });
          });
        }

        const order_id = results.insertId;

        const values = dish_details.map((dish) => [
          dish.dish_name,
          dish.dish_price,
          order_id,
        ]);

        connection.query(
          'INSERT INTO dish_details (dish_name, dish_price, order_id) VALUES (?, ?, ?, ?)',
          [values],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                res
                  .status(500)
                  .send({ error: 'Error while adding dish details.' });
              });
            }
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  res
                    .status(500)
                    .send({ error: 'Error while committing transaction.' });
                });
              }
              res.send({
                message: 'Order and dish details added successfully.',
              });
            });
          }
        );
      }
    );
  });
});

module.exports = router;
