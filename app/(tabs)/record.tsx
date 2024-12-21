import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { createContainerStyles } from '@/constants/Containers';
import RecordingButton from '@/components/recording/RecordingButton';
import MessageButton from '@/components/messages/MessageButton';
import TextAreaRecordingInput from '@/components/recording/TextAreaRecordingInput';
import ConnectionStatus from '@/components/connection/ConnectionStatus';
import { useRouter } from 'expo-router';
import { useConnectivity } from '@/contexts/ConnectivityContext';

/**
 * RecordPage Component
 *
 * This component represents the main recording page of the application.
 * It allows users to input text, record audio, and send messages.
 *
 * @returns {React.FC} A functional component for the recording page
 */
const useRecordingButtonState = (textAreaState: inputState): boolean => {
  return textAreaState === 'transcribing';
};

type inputState = 'normal' | 'recording' | 'transcribing';

const RecordPage: React.FC = () => {
  const router = useRouter();

  // Access the connection status from the connectivity context
  const { connectionStatus, lastTranscribedMessage } = useConnectivity();

  // State for managing the message to be analyzed
  const [analyzeMessage, setAnalyzeMessage] = useState('');

  const [textAreaState, setTextAreaState] = useState<inputState>('normal');
  const recordingButtonState = useRecordingButtonState(textAreaState);

  // Get the current color scheme and set up colors and container styles
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const containers = createContainerStyles(colors);
  const [transcribedText, setTranscribedText] = useState('');

  /**
   * Handles the start of a recording session
   */
  const handleRecordingStart = () => {
    setTextAreaState('recording');
  };

  /**
   * Handles the completion of a recording session
   * @param {string | null} uri - The URI of the recorded audio file
   */
  const handleRecordingComplete = (uri: string | null) => {
    if (uri) {
      setTextAreaState('transcribing');
    } else {
      console.log('Recording failed or was cancelled');
      setTextAreaState('normal');
    }
  };

  // Effect to redirect to the connect screen if disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      router.replace('/settings/connect');
    }
  }, [connectionStatus, router]);

  useEffect(() => {
    console.log('GOT TEXT', lastTranscribedMessage);

    if (
      lastTranscribedMessage &&
      lastTranscribedMessage.type === 'transcribe_response'
    ) {
      setTranscribedText(lastTranscribedMessage.message);
      //setTextAreaState("normal");
    }
  }, [lastTranscribedMessage]);

  return (
    <View style={containers.container}>
      {/* Top container for connection status */}
      <View style={containers.topContainer}>
        <ConnectionStatus />
      </View>

      {/* Text input area */}
      <TextAreaRecordingInput
        textAreaState={textAreaState}
        onTextChange={setAnalyzeMessage}
        transcription={transcribedText}
      />

      {/* Bottom container for action buttons */}
      <View style={styles.bottomContainer}>
        <View style={containers.row}>
          <MessageButton message={analyzeMessage} />
          <RecordingButton
            onRecordingComplete={handleRecordingComplete}
            onRecordingStart={handleRecordingStart}
            disabled={recordingButtonState}
            style={styles.recordingButtonMargin}
          />
        </View>
      </View>
    </View>
  );
};

// Styles specific to this component
const styles = StyleSheet.create({
  bottomContainer: {
    marginBottom: 10,
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  recordingButtonMargin: {
    marginLeft: 10,
  },
});

export default RecordPage;
