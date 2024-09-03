import React from "react";
import { Pressable, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { createInputsStyles } from "@/constants/Inputs";
import { useConnectivity } from "@/contexts/ConnectivityContext";

/**
 * Props for the ConnectionButton component
 */
type ConnectionButtonProps = {
	colorScheme: "light" | "dark";
};

/**
 * ConnectionButton Component
 *
 * This component renders a button that reflects the current connection status
 * and allows the user to initiate a connection when disconnected.
 *
 * @param {ConnectionButtonProps} props - The props for the ConnectionButton
 * @returns {React.FC} A functional component representing the connection button
 */
export default function ConnectionButton({
	colorScheme,
}: ConnectionButtonProps) {
	const { connectionStatus, handleConnect } = useConnectivity();
	const colors = Colors[colorScheme];
	const inputs = createInputsStyles(colors);

	/**
	 * Determines the button style based on the connection status
	 * @returns {object} The appropriate button style
	 */
	const getButtonStyle = () => {
		switch (connectionStatus) {
			case "connected":
				return inputs.buttonSuccess;
			case "connecting":
				return inputs.buttonWarning;
			default:
				return inputs.buttonDanger;
		}
	};

	/**
	 * Determines the button text style based on the connection status
	 * @returns {object} The appropriate text style
	 */
	const getButtonTextStyle = () => {
		switch (connectionStatus) {
			case "connected":
				return inputs.buttonSuccessText;
			case "connecting":
				return inputs.buttonWarningText;
			default:
				return inputs.buttonDangerText;
		}
	};

	/**
	 * Determines the button text based on the connection status
	 * @returns {string} The appropriate button text
	 */
	const getButtonText = () => {
		switch (connectionStatus) {
			case "connected":
				return "Connected";
			case "connecting":
				return "Connecting...";
			default:
				return "Connect";
		}
	};

	/**
	 * Handles the button press event
	 * Initiates connection if not already connected
	 */
	const handleButtonPress = () => {
		if (connectionStatus !== "connected") {
			handleConnect();
		}
	};

	return (
		<Pressable
			style={[inputs.button, getButtonStyle()]}
			onPress={handleButtonPress}
			disabled={connectionStatus === "connecting"}>
			<Text style={[inputs.buttonText, getButtonTextStyle()]}>
				{getButtonText()}
			</Text>
		</Pressable>
	);
}
