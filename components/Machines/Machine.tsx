// components/Machine.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { createInputsStyles } from "@/constants/Inputs";
import { createContainerStyles } from "@/constants/Containers";
import { createTextStyles } from "@/constants/Text";

type MachineState = "Connect" | "Disconnect" | "Offline" | "Busy";

interface MachineProps {
	name: string;
	state: MachineState;
	onPress: () => void;
}

const Machine: React.FC<MachineProps> = ({ name, state, onPress }) => {
	const buttonColor = {
		Connect: "#4CAF50",
		Offline: "#F44336",
		Busy: "#FFC107",
		Disconnect: "#4CAF50",
	}[state];

	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme || "light"];
	const inputs = createInputsStyles(colors);
	const containers = createContainerStyles(colors);
	const text = createTextStyles(colors);

	return (
		<View style={[styles.machineCard, { borderColor: colors.textSubtle }]}>
			<Text style={[text.h3, { color: colors.text }]}>{name}</Text>
			<Pressable
				style={[
					inputs.button,
					inputs.buttonShrink,
					{ backgroundColor: buttonColor },
				]}
				onPress={onPress}>
				<Text style={styles.buttonText}>{state}</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	machineCard: {
		borderWidth: 2,
		marginHorizontal: 4,
		marginVertical: 8,
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
	name: {
		fontSize: 18,
		fontWeight: "bold",
	},
	button: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 4,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
	},
});

export default Machine;
