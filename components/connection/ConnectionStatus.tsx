import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useConnectivity } from "@/contexts/ConnectivityContext";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
const ConnectionStatus: React.FC = () => {
	const { connectionStatus, handleDisconnect } = useConnectivity();
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? "light"];

	const getStatusColor = () => {
		switch (connectionStatus) {
			case "connected":
				return "green";
			case "connecting":
				return "orange";
			case "disconnected":
				return "red";
			default:
				return "gray";
		}
	};

	const getStatusText = () => {
		switch (connectionStatus) {
			case "connected":
				return "Connected";
			case "connecting":
				return "Connecting...";
			case "disconnected":
				return "Disconnected";
			default:
				return "Unknown";
		}
	};
	const handlePress = () => {
		if (connectionStatus === "connected") {
			handleDisconnect();
		}
	};

	return (
		<Pressable style={[styles.container]} onPress={handlePress}>
			<View
				style={[styles.circle, { backgroundColor: getStatusColor() }]}></View>
			<Text style={[styles.connectedText, { color: colors.text }]}>
				{getStatusText()}
			</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		flexShrink: 1,
	},
	circle: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "green",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
	},
	connectedText: {
		flex: 1,
		marginLeft: 10,
		fontSize: 16,
	},
});

export default ConnectionStatus;
