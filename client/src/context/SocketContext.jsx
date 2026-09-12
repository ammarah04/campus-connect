import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { accessToken, user } = useAuth();
  const socketRef = useRef(null);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    if (!accessToken || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token: accessToken },
    });

    socket.on("newNotification", (notification) => {
      setLatestNotification(notification);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [accessToken, user]);

  return (
    <SocketContext.Provider value={{ latestNotification }}>
      {children}
    </SocketContext.Provider>
  );
};