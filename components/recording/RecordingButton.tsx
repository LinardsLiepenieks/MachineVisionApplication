import React, { useState, useEffect } from "react";
import { StyleSheet, Pressable, ViewStyle, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useConnectivity } from "@/contexts/ConnectivityContext";
import * as FileSystem from "expo-file-system";

interface RecordingButtonProps {
	onRecordingComplete: (uri: string | null) => void;
	onRecordingStart: () => void;
	style?: ViewStyle;
	disabled?: boolean;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({
	onRecordingComplete,
	onRecordingStart,
	style,
	disabled = false,
}) => {
	const [isRecording, setIsRecording] = useState(false);
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [recordingDuration, setRecordingDuration] = useState(0);
	const { url, key, sendBinaryMessage } = useConnectivity();

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

	const startRecording = async () => {
		if (disabled) return;

		try {
			await Audio.requestPermissionsAsync();
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY
			);
			setRecording(recording);
			setIsRecording(true);
			onRecordingStart();
		} catch (error) {
			console.error("Failed to start recording", error);
		}
	};

	const stopRecording = async () => {
		if (!recording) return;

		setIsRecording(false);
		try {
			await recording.stopAndUnloadAsync();
			const uri = recording.getURI();

			if (uri && url && key) {
				await uploadRecording(uri);
				await FileSystem.deleteAsync(uri);
			} else {
				onRecordingComplete(null);
			}
		} catch (error) {
			console.error("Failed to stop recording", error);
			onRecordingComplete(null);
		}
	};

	const uploadRecording = async (uri: string) => {
		try {
			const response = await fetch(uri);
			const blob = await response.blob();

			// Log blob details
			let uriParts = uri.split(".");
			let fileType = uriParts[uriParts.length - 1];
			const filename = `recording.${fileType}`;
			const mimeType = `audio/x-${fileType}`;
			sendBinaryMessage(blob, filename, mimeType);
			onRecordingComplete(uri);
		} catch (error) {
			console.error("Error uploading recording", error);
			onRecordingComplete(null);
		}
	};

	const handlePressIn = () => {
		startRecording();
	};

	const handlePressOut = () => {
		stopRecording();
	};

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	return (
		<View>
			<Pressable
				style={[
					styles.recordingButton,
					isRecording && styles.recordingButtonPressed,
					disabled && styles.disabledButton,
					style,
				]}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}>
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
		backgroundColor: "red",
		borderWidth: 3,
		borderColor: "rgba(255, 255, 255, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	recordingButtonPressed: {
		backgroundColor: "rgba(255, 0, 0, 0.6)",
	},
	durationText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 12,
	},
	disabledButton: {
		opacity: 0.5,
		backgroundColor: "black",
	},
});

export default RecordingButton;
