import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { socketService } from "../services/socketService";

const NotificationContainer = styled.div`
  position: fixed;
  top: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const Notification = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12rem;
  animation: slideDown 0.3s ease-out;
  font-size: 3rem;
  width: calc(100% - 4rem);
  padding: 1rem;
  margin: 0 2rem;
  text-transform: capitalize;
  font-family: "Space Mono", monospace;
  text-transform: uppercase;
  font-weight: 600;
  text-align: center;

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socketService.connect();

    const cleanup = socketService.onNotification((notification) => {
      console.log("notification", notification);
      // Ensure each notification has a unique ID if not provided
      const notificationWithId = {
        ...notification,
        id: notification.id || Math.random().toString(36).substring(2, 15)
      };

      setNotifications((prev) => [...prev, notificationWithId]);

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationWithId.id)
        );
      }, 5000);
    });

    return () => {
      cleanup();
      socketService.disconnect();
    };
  }, []);

  return (
    <NotificationContainer>
      {notifications.map((notification) => (
        <Notification key={notification.id} type={notification.type}>
          {notification.message}
        </Notification>
      ))}
    </NotificationContainer>
  );
};

export default NotificationCenter;
