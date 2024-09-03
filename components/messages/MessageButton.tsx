import React from "react";
import { Pressable, Text } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { createInputsStyles } from "@/constants/Inputs";
import { useConnectivity } from "@/contexts/ConnectivityContext";

// Define the props interface for the MessageButton component
interface MessageButtonProps {
	message: string;
}

/**
 * MessageButton Component
 *
 * This component renders a button that sends a message when pressed.
 * It uses the app's color scheme and connectivity context.
 *
 * @param {MessageButtonProps} props - The props for the MessageButton component
 * @returns {React.FC} A functional component representing the message send button
 */
const MessageButton: React.FC<MessageButtonProps> = ({ message }) => {
	// Access the sendAnalyzeMessage function from the connectivity context
	const { sendAnalyzeMessage } = useConnectivity();

	// Get the current color scheme
	const colorScheme = useColorScheme();

	// Determine the colors based on the current color scheme
	const colors = Colors[colorScheme || "light"];

	// Create input styles using the current colors
	const inputs = createInputsStyles(colors);

	/**
	 * Handles the press event of the send button
	 * Calls sendAnalyzeMessage with the current message
	 */
	const handleSendPress = () => {
		sendAnalyzeMessage(message);
	};

	return (
		<Pressable
			style={({ pressed }) => [
				inputs.button,
				inputs.buttonShrink,
				{
					opacity: pressed ? 0.6 : 1,
					backgroundColor: pressed ? colors.text : colors.background,
				},
			]}
			onPress={handleSendPress}
			android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}>
			<Text style={[inputs.buttonText]}>Send</Text>
		</Pressable>
	);
};

export default MessageButton;
