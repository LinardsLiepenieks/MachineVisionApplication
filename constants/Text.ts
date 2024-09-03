import { StyleSheet } from "react-native";
import { ColorSet } from "./Colors";

export const createTextStyles = (colors: ColorSet) =>
	StyleSheet.create({
		h2: {
			fontSize: 24,
			fontWeight: "bold",
			marginBottom: 20,
			color: colors.text,
		},

		h3: {
			fontSize: 22,
			fontWeight: "600",
			marginBottom: 16,
		},

		label: {
			color: colors.text,
			marginBottom: 5,
		},
		textSm: {
			fontSize: 14,
		},
		textMd: {
			fontSize: 16,
		},
		textStrong: {
			fontWeight: "bold",
		},
		textOpaque: {
			opacity: 0.6,
		},
	});
