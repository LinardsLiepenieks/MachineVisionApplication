import React, { useCallback } from 'react';
import { StyleSheet, Pressable, ViewStyle, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAudio } from '@/contexts/AudioContext';

interface RecordingButtonProps {
  onRecordingComplete: (uri: string | null) => void;
  onRecordingStart: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const LONG_PRESS_THRESHOLD = 500; // milliseconds

const RecordingButton: React.FC<RecordingButtonProps> = ({
  onRecordingComplete,
  onRecordingStart,
  style,
  disabled = false,
}) => {
  const {
    isRecording,
    setIsRecording,
    isPersisting,
    setIsPersisting,
    recordingDuration,
    permissionsGranted,
    initializeRecording,
    startRecording,
    stopRecording,
    formatDuration,
  } = useAudio();

  const handleStartRecording = useCallback(async () => {
    try {
      await initializeRecording();
      await startRecording();
      setIsRecording(true);
      onRecordingStart();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }, [initializeRecording, startRecording, onRecordingStart]);

  const handleStopRecording = useCallback(async () => {
    try {
      await stopRecording();
      setIsRecording(false);
      setIsPersisting(false);
      onRecordingComplete(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsPersisting(false);
      onRecordingComplete(null);
    }
  }, [stopRecording, onRecordingComplete]);

  const handlePressIn = useCallback(() => {
    if (isRecording && isPersisting) {
      handleStopRecording();
      setIsPersisting(false);
      return;
    }

    setIsPersisting(true);
    handleStartRecording();
  }, [isRecording, isPersisting, handleStartRecording, handleStopRecording]);

  const handlePressOut = useCallback(() => {
    if (isRecording && !isPersisting) {
      handleStopRecording();
    }
  }, [isRecording, isPersisting, handleStopRecording]);

  const handleLongPress = useCallback(() => {
    if (isRecording && isPersisting) {
      setIsPersisting(false);
    }
  }, [isRecording, isPersisting]);

  return (
    <View>
      <Pressable
        style={[
          styles.recordingButton,
          isRecording && styles.recordingButtonPressed,
          (disabled || !permissionsGranted) && styles.disabledButton,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={LONG_PRESS_THRESHOLD}
        disabled={disabled || !permissionsGranted}
      >
        {isRecording ? (
          <Text style={styles.durationText}>
            {formatDuration(recordingDuration)}
          </Text>
        ) : (
          <FontAwesome name="microphone" size={24} color="white" />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  recordingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'red',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButtonPressed: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  durationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: 'black',
  },
});

export default RecordingButton;
