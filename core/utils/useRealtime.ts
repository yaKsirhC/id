import { parseCookies } from "nookies";
import { useContext, useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const useRealtime = (collection: string) => {

    const { 'nextauth.token': token } = parseCookies()

    const SOCKET_SERVER_URL = 'https://api.cliq.live';
    const [lastMessage, setLastMessage] = useState<any>()
    const socketRef = useRef<any>();

    const sendMessage = (message: any) => {
        socketRef.current.emit('data', { token, ...message })
    }

    useEffect(() => {
        if (!collection) return
        socketRef.current = socketIOClient(`${SOCKET_SERVER_URL}`, {
            query: { collection, token },
        });

        socketRef.current.on('data', (message: any) => {
            if (message) {
                setLastMessage(message)
            }

        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [collection]);

    return { lastMessage, sendMessage };
};

export default useRealtime;