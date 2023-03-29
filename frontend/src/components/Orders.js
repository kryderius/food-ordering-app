import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
// import moment from 'moment-timezone';
import 'moment/locale/pl';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const jwttoken = localStorage.getItem('token');
    axios
      .get('http://localhost:5000/api/getallorders', {
        headers: { Authorization: `Bearer ${jwttoken}` },
      })
      .then((res) => {
        setOrders(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  console.log(orders);
  moment.locale('pl');

  return (
    <div>
      <h2>Lista zamówień</h2>
      <table style={{ width: '100%', border: '1px solid' }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Data i godzina zamówienia</th>
            <th>Rodzaj płatności</th>
            <th>Szczegóły zamówienia</th>
            <th>Suma zamówienia</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.order_id}</td>
              <td>{moment.utc(order.order_date).local().format('LLL')}</td>
              <td>{order.order_paymentMethod}</td>
              <td style={{ display: 'flex', flexDirection: 'column' }}>
                {order.dish_details.map((dish_detail) => (
                  <span>
                    {dish_detail.dish_name} - {dish_detail.dish_price} zł /
                    Ilość: {dish_detail.dish_quantity}
                  </span>
                ))}
              </td>
              <td>{order.order_content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
