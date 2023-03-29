import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Orders from './Orders';
import NewOrders from './NewOrders';
import Container from './Container';
import './Dashboard.css';

const Dashboard = ({ userData, logout }) => {
  // const [newOrder, setNewOrder] = useState(null);

  // useEffect(() => {
  //   const socket = io('http://localhost:5000');
  //   socket.on('new_order', (data) => {
  //     setNewOrder(data);
  //   });
  //   return () => socket.disconnect();
  // }, []);

  // console.log(newOrder);

  return (
    <div className='dashboard'>
      {/* <div>Witaj {userData.username}</div>
      <div>
        <button onClick={logout}>Wyloguj</button>
        <></>
      </div> */}
      <Container />
      <NewOrders />
      <div>{/* <Orders /> */}</div>
    </div>
  );
};

export default Dashboard;
