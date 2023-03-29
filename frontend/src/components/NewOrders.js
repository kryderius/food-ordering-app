import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './NewOrders.css';

const NewOrders = () => {
  const [newOrder, setNewOrder] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('new_order', (data) => {
      setNewOrder(data);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className='col-right'>
      <p className='text'>Nowe zamówienia:</p>
      <div className='newOrders-list'>
        {newOrder && (
          <div className='newOrder-popup'>
            {newOrder.order_details.map((order) => (
              <tr key={order.id}>
                <td>{order.dish_name}</td>
                <td>{order.dish_price}</td>
                <td>{order.quantity}</td>
              </tr>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOrders;
