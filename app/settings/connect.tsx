import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Pressable,
	TextInput,
	StyleSheet,
	useColorScheme,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { createInputsStyles } from "@/constants/Inputs";
import { createContainerStyles } from "@/constants/Containers";
import { createTextStyles } from "@/constants/Text";
import { useConnectivity } from "@/contexts/ConnectivityContext";
import { useCredentials } from "@/contexts/CredentialsContext";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import ConnectionButton from "@/components/connection/ConnectionButton";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * StartupScreen component
 * Renders the initial screen for setting up connection credentials
 */
export default function StartupScreen() {
	// Destructure values and functions from the connectivity context
	const { url, setUrl, key, setKey, connectionStatus } = useConnectivity();
	const { storedCredentials } = useCredentials();

	const router = useRouter();

	// State to track if credentials have been initialized
	const [hasInitialized, setHasInitialized] = useState(false);

	// Get the current color scheme and create style objects
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? "light"];
	const inputs = createInputsStyles(colors);
	const containers = createContainerStyles(colors);
	const text = createTextStyles(colors);

	// Create additional styles
	const styles = StyleSheet.create({
		credentialIconContainer: {
			padding: 8,
			position: "absolute",
			top: 24,
			left: 18,
		},
	});

	/**
	 * Navigate to the stored credentials screen
	 */
	const handleIconPress = () => {
		router.push("/settings/storedCredentials");
	};

	// Effect to initialize credentials from stored values
	useEffect(() => {
		if (storedCredentials.length > 0 && !hasInitialized) {
			const { url, key } = storedCredentials[0];
			setUrl(url);
			setKey(key);
			setHasInitialized(true);
		}
	}, [storedCredentials, hasInitialized, setUrl, setKey]);

	return (
		<SafeAreaView style={[containers.container]}>
			{/* Stored credentials icon */}
			<View style={[styles.credentialIconContainer]}>
				<Pressable onPress={handleIconPress}>
					<FontAwesome name="key" size={30} color={colors.text} />
				</Pressable>
			</View>

			{/* URL input */}
			<View style={containers.inputContainer}>
				<Text style={text.label}>URL</Text>
				<TextInput
					style={inputs.input}
					value={url}
					onChangeText={setUrl}
					placeholder="Enter URL"
					placeholderTextColor={colors.text}
					editable={connectionStatus === "disconnected"}
				/>
			</View>

			{/* KEY input */}
			<View style={containers.inputContainer}>
				<Text style={text.label}>KEY</Text>
				<TextInput
					style={inputs.input}
					value={key}
					onChangeText={setKey}
					placeholder="Enter KEY"
					placeholderTextColor={colors.text}
					secureTextEntry
					editable={connectionStatus === "disconnected"}
				/>
			</View>

			{/* Connection button */}
			<ConnectionButton colorScheme={colorScheme ?? "light"} />
		</SafeAreaView>
	);
}
