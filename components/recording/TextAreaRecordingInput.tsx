import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Text, Pressable } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { createInputsStyles } from "@/constants/Inputs";
import { createContainerStyles } from "@/constants/Containers";

type TextAreaState = "normal" | "recording" | "transcribing";

interface TextAreaRecordingInputProps {
	onTextChange: (text: string) => void;
	textAreaState: TextAreaState;
	transcription?: string;
}

const TextAreaRecordingInput: React.FC<TextAreaRecordingInputProps> = ({
	onTextChange,
	textAreaState,
	transcription,
}) => {
	const [text, setText] = useState(transcription || "");

	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme || "light"];
	const inputs = createInputsStyles(colors);
	const containers = createContainerStyles(colors);

	useEffect(() => {
		if (transcription) {
			setText((prevText) => {
				const timestamp = new Date().toLocaleTimeString();
				//const newEntry = `/*[${timestamp}] ${transcription}`;
				const newText = prevText
					? `${prevText}\n${transcription}`
					: transcription;
				onTextChange(newText);
				return newText;
			});
		}
	}, [transcription, onTextChange]);

	const handleTextChange = (newText: string) => {
		setText(newText);
		onTextChange(newText);
	};

	const handleClearText = () => {
		setText("");
		onTextChange("");
	};

	return (
		<View style={containers.textAreaContainer}>
			<TextInput
				style={[inputs.textArea, styles.textAreaPadding]}
				placeholder="Enter your text here"
				placeholderTextColor={colors.textSubtle}
				multiline={true}
				value={text}
				onChangeText={handleTextChange}
				editable={textAreaState === "normal"}
			/>
			<Pressable style={styles.clearLinkBtn} onPress={handleClearText}>
				<Text style={styles.clearLinkBtnTxt}>Clear</Text>
			</Pressable>
			{textAreaState === "recording" && (
				<View style={styles.overlay}>
					<Text style={styles.overlayText}>Recording in progress...</Text>
				</View>
			)}
			{textAreaState === "transcribing" && (
				<View style={styles.overlay}>
					<Text style={styles.overlayText}>Transcribing...</Text>
					{/* You can add a loading indicator here if desired */}
				</View>
			)}
		</View>
	);
};
const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
	overlayText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	textAreaPadding: {
		paddingTop: 24,
	},
	clearLinkBtn: {
		position: "absolute",
		top: 8,
		right: 10,
	},
	clearLinkBtnTxt: {
		color: "blue",
		textDecorationLine: "underline",
	},
});
export default TextAreaRecordingInput;
