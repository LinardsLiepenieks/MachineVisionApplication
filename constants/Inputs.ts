import { Button, StyleSheet } from "react-native";
import { ColorSet } from "./Colors";

export const createInputsStyles = (colors: ColorSet) =>
	StyleSheet.create({
		input: {
			backgroundColor: colors.background,
			color: colors.text,
			padding: 10,
			borderRadius: 5,
			borderColor: colors.text,
			borderWidth: 1,
			width: "100%",
		},
		textArea: {
			flex: 1,
			borderColor: "gray",
			borderWidth: 1,
			borderRadius: 5,
			padding: 10,
			textAlignVertical: "top",
			color: colors.text,
		},

		button: {
			padding: 15,
			borderRadius: 5,
			borderWidth: 1,
			borderColor: colors.text,
			alignItems: "center",
			justifyContent: "center", // Center the text inside the button
			width: "100%", // Set a maximum width to prevent overflow
		},
		buttonThin: {
			paddingHorizontal: 10,
			paddingVertical: 5,
		},
		buttonShrink: {
			flex: 1, // Allow the button to shrink if needed
			maxWidth: "100%", // Set a maximum width to prevent overflow
		},
		buttonText: {
			color: colors.text,
			fontWeight: "bold",
		},
		buttonDanger: {
			backgroundColor: colors.danger,
		},
		buttonSuccess: {
			backgroundColor: colors.success,
		},
		buttonDangerText: {
			color: colors.textInverted,
		},
		buttonSuccessText: {
			color: colors.textInverted,
		},
		buttonWarning: {
			backgroundColor: colors.warning,
		},
		buttonWarningText: {
			color: colors.text,
		},
		switch: {
			marginRight: 0,
		},
	});
