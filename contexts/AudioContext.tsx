import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useConnectivity } from './ConnectivityContext';
import AudioStream from 'react-native-live-audio-stream';
import base64 from 'base64-js';

interface AudioContextType {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  recordingDuration: number;
  permissionsGranted: boolean;
  initializeRecording: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  formatDuration: (seconds: number) => string;
  isPersisting: boolean;
  setIsPersisting: (isPersisting: boolean) => void;
}

interface AudioProviderProps {
  children: React.ReactNode;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const { sendStreamChunk } = useConnectivity();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPersisting, setIsPersisting] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const chunkIndexRef = useRef<number>(0);

  // Add visualization helper function
  const visualizeWaveform = (pcmData: Int16Array, width: number = 50) => {
    const samples = Array.from(pcmData);
    const blockSize = Math.floor(samples.length / width);
    const visualizer = new Array(width).fill(0);

    // Calculate average amplitude for each block
    for (let i = 0; i < width; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      const block = samples.slice(start, end);
      const sum = block.reduce((acc, val) => acc + Math.abs(val), 0);
      visualizer[i] = sum / blockSize;
    }

    // Find max for normalization
    const max = Math.max(...visualizer);

    // Create visualization using ASCII characters
    const height = 8;
    const chars = ' ▁▂▃▄▅▆▇█';

    // Draw the waveform
    const normalized = visualizer
      .map((v) => {
        const normalized = v / max;
        const index = Math.floor(normalized * (chars.length - 1));
        return chars[index];
      })
      .join('');
    //console.log('\n[Audio Waveform]');
    //console.log(normalized);
    //console.log(`Chunk ${chunkIndexRef.current}, Max amplitude: ${max}`);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionsGranted(true);
        }
      } catch (err) {
        console.error('Failed to request permissions:', err);
      }
    } else {
      setPermissionsGranted(true);
    }
  };

  const initializeRecording = async () => {
    await requestPermissions();

    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      bufferSize: 2048,
      wavFile: '',
    };

    AudioStream.init(options);
  };

  useEffect(() => {
    AudioStream.on('data', (base64Data: string) => {
      if (isRecording) {
        const binaryData = base64.toByteArray(base64Data);

        /*console.log('Audio data:', {
          base64Length: base64Data.length,
          decodedLength: binaryData.length,
          sampleData: Array.from(binaryData.slice(0, 10)),
        });*/

        // Convert to Int16Array for PCM data
        const pcmData = new Int16Array(binaryData.buffer);

        //Helper function for testing
        //console.log(Array.from(pcmData));
        visualizeWaveform(pcmData);

        sendStreamChunk({
          type: 'stream_chunk',
          data: Array.from(pcmData),
          isLastChunk: false,
          timestamp: Date.now(),
          sampleRate: 16000,
          format: 'pcm',
          chunkIndex: chunkIndexRef.current++,
        });
      }
    });
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (!permissionsGranted) {
      console.error('Permissions not granted');
      return;
    }

    try {
      chunkIndexRef.current = 0;
      setIsRecording(true);
      AudioStream.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [permissionsGranted]);

  const stopRecording = useCallback(async () => {
    try {
      // Send final chunk before stopping
      sendStreamChunk({
        type: 'stream_chunk',
        data: [], // Empty data for final chunk
        isLastChunk: true,
        timestamp: Date.now(),
        sampleRate: 16000,
        format: 'pcm',
        chunkIndex: chunkIndexRef.current++,
      });

      AudioStream.stop();

      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }, [sendStreamChunk]);

  useEffect(() => {
    initializeRecording();
    return () => {
      AudioStream.stop();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const value = {
    isRecording,
    setIsRecording,
    recordingDuration,
    permissionsGranted,
    initializeRecording,
    startRecording,
    stopRecording,
    formatDuration,
    isPersisting,
    setIsPersisting,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext;
