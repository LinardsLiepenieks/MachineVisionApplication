// src/contexts/ConnectivityContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCredentials, Credential } from './CredentialsContext';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface Message {
  type: string;
  message: string;
}

interface Machine {
  id: number;
  name: string;
  state: string;
  key: string;
}

interface StreamChunkMessage {
  type: 'stream_chunk';
  data: number[]; // Array of audio samples
  isLastChunk: boolean;
  timestamp: number;
  sampleRate: number;
  format: string;
  chunkIndex: number;
}

interface ConnectivityContextType {
  url: string;
  setUrl: (url: string) => void;
  key: string;
  setKey: (key: string) => void;
  connectionStatus: ConnectionStatus;
  handleConnect: () => Promise<void>;
  handleDisconnect: () => void;
  sendAnalyzeMessage: (message: string) => void;
  sendBinaryMessage: (blob: Blob, filename: string, fileType: string) => void;
  sendReloadMachinesMessage: () => void;
  sendConnectToMachineMessage: (key: string) => void;
  sendDisconnectFromMachineMessage: (key: string) => void;
  lastTranscribedMessage: Message | null;
  machines: Machine[];
  sendStreamChunk: (message: StreamChunkMessage) => void;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(
  undefined
);

interface ConnectivityProviderProps {
  children: ReactNode;
}

export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = ({
  children,
}) => {
  const { addCredential, loadCredentials } = useCredentials();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastTranscribedMessage, setLastTranscribedMessage] =
    useState<Message | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const updateMachineState = (key: string, newState: string) => {
    setMachines((prevMachines) =>
      prevMachines.map((machine) =>
        machine.key === key ? { ...machine, state: newState } : machine
      )
    );
  };

  const handleConnect = async () => {
    if (!url || !key) {
      Alert.alert('Error', 'Please enter both URL and KEY');
      return;
    }
    if (socket) {
      socket.close();
    }

    setConnectionStatus('connecting');

    const newSocket = new WebSocket(url, key);

    setSocket(newSocket);

    try {
      newSocket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data, (key, value) => {
          if (value === 'NaN') return NaN;
          if (value === 'Infinity') return Infinity;
          if (value === '-Infinity') return -Infinity;
          return value;
        });

        if (message.type === 'auth_response') {
          if (message.status === 'success') {
            setConnectionStatus('connected');
            addCredential(url, key)
              .then(() => router.replace('/(tabs)/record'))
              .then(() => console.log('Connection Successful'))
              .catch((error) =>
                console.error('Error: saving credentials: ', error)
              );
          } else {
            throw new Error('Authentication failed');
          }
        }
        if (message.type === 'transcribe_response') {
          console.log(message.transcription);
          setLastTranscribedMessage(message);
        }
        if (message.type === 'update_machines') {
          if (Array.isArray(message.machines)) {
            setMachines(message.machines);
          }
        }
        if (message.type === 'machine_connection_status') {
          const { key, status, action, message: statusMessage } = message;

          switch (status) {
            case 'success':
              updateMachineState(
                key,
                action === 'connect' ? 'Disconnect' : 'Connect'
              );
              break;
            case 'error':
              Alert.alert('Error', statusMessage);
              break;
            case 'busy':
              Alert.alert('Machine Busy', 'The machine is currently in use');
              updateMachineState(key, 'Busy');
              break;
          }
        }
      });

      newSocket.addEventListener('error', (error) => {
        throw error;
      });

      newSocket.addEventListener('close', (event) => {
        if (event.code === 1000) {
          console.log(
            `WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`
          );
        } else if (event.code === 1006) {
          console.error('Server unreachable code=1006');
          Alert.alert('Server unreachable code=1006');
        } else if (event.code === 4001) {
          console.error('Route rejected - check for typos code=4001');
          Alert.alert('Route rejected - check for typos');
        } else if (event.code === 4002) {
          console.error('API Key rejected - check for typos code=4001');
          Alert.alert('API Key rejected - check for typos');
        } else if (event.code === 4003) {
          console.error(
            'Mismatch for route and device type - please input user route and API key'
          );
          Alert.alert(
            'Mismatch for route and device type - please input user route and API key'
          );
        } else if (event.code === 4004) {
          console.error('Malformed API key');
          Alert.alert('Malformed API key (4004)');
        } else {
          console.log(event);
          console.error(
            `WebSocket connection closed with code=${event.code} and reason ${event.reason}`
          );
        }
        setConnectionStatus('disconnected');
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      Alert.alert(
        'Connection Failed',
        `Unable to connect to the WebSocket server. ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setConnectionStatus('disconnected');
    }
  };

  const handleDisconnect = async () => {
    if (socket) {
      socket.close(1000, 'Client initiated closure'); // Use a close code and reason
      setSocket(null);
    }
    setConnectionStatus('disconnected');
    setUrl('');
    setKey('');
    try {
      await AsyncStorage.removeItem('connectivity_credentials');
    } catch (error) {
      console.error('Error removing credentials:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const sendAnalyzeMessage = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'nlp_analyze',
        text: message,
      });
      socket.send(payload);
      console.log('Message sent:', payload);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const sendBinaryMessage = (
    blob: Blob,
    filename: string,
    fileType: string
  ) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const payload = {
          type: 'transcribe',
          filename,
          fileType,
          data: new Uint8Array(arrayBuffer),
        };
        console.log('SENDING');
        socket.send(JSON.stringify(payload));
        //console.log("Binary message sent:", payload);
      };
      reader.readAsArrayBuffer(blob);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const sendReloadMachinesMessage = () => {
    console.log('SENDING RELOAD MESSAGE');
    if (socket && socket.readyState == WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'reload_machines',
      });
      socket.send(payload);
    } else {
      console.log('Websocket is not connected');
    }
  };
  const sendConnectToMachineMessage = (key: string) => {
    console.log('SENDING CONNECT MESSAGE');
    if (socket && socket.readyState == WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'connect_to_machine',
        key: key,
      });
      socket.send(payload);
    } else {
      console.log('Websocket is not connected');
    }
  };
  const sendDisconnectFromMachineMessage = (key: string) => {
    console.log('SENDING DISCONNECT MESSAGE');
    if (socket && socket.readyState == WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'disconnect_from_machine',
        key: key,
      });
      socket.send(payload);
    } else {
      console.log('Websocket is not connected');
    }
  };

  const sendStreamChunk = (message: StreamChunkMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'transcribe_audio', // type for the consumer to understand
        data: Array.from(message.data), // Convert TypedArray to regular array
        isLastChunk: message.isLastChunk,
        timestamp: message.timestamp,
        sampleRate: message.sampleRate,
        format: message.format,
        chunkIndex: message.chunkIndex,
      };
      if (payload.data.length === 0 && !payload.isLastChunk) {
        console.log(payload);
        console.warn('Empty chunk received but not marked as last chunk');
        return;
      }

      // Log chunk info without the full data array
      /*console.log({
        type: payload.type,
        chunkIndex: payload.chunkIndex,
        dataLength: payload.data.length,
        isLastChunk: payload.isLastChunk,
        timestamp: new Date(payload.timestamp).toISOString(),
      });*/

      socket.send(JSON.stringify(payload));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <ConnectivityContext.Provider
      value={{
        url,
        setUrl,
        key,
        setKey,
        connectionStatus,
        handleConnect,
        handleDisconnect,
        sendAnalyzeMessage,
        sendBinaryMessage,
        sendReloadMachinesMessage,
        sendConnectToMachineMessage,
        sendDisconnectFromMachineMessage,
        lastTranscribedMessage,
        machines,
        sendStreamChunk,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = (): ConnectivityContextType => {
  const context = useContext(ConnectivityContext);
  if (context === undefined) {
    throw new Error(
      'useConnectivity must be used within a ConnectivityProvider'
    );
  }
  return context;
};
