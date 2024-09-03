import { StyleSheet, StatusBar, Platform } from "react-native";
import { ColorSet } from "./Colors";

export const createContainerStyles = (colors: ColorSet) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			position: "relative",
			alignItems: "center",
			backgroundColor: colors.background,
			paddingHorizontal: 20,
			paddingTop:
				Platform.OS === "android"
					? (StatusBar.currentHeight || 28) + 12
					: 0 + 28,
		},
		topContainer: {
			flexDirection: "row",
			alignItems: "center",
			minHeight: 60,
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
		},
		inputContainer: {
			width: "100%",
			marginBottom: 20,
		},
		textAreaContainer: {
			width: "100%",
			flex: 1,
		},
	});
