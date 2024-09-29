import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from "react-native";
import { useConnectivity } from "@/contexts/ConnectivityContext";
import { useCredentials, Credential } from "@/contexts/CredentialsContext";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { createInputsStyles } from "@/constants/Inputs";
import { createContainerStyles } from "@/constants/Containers";
import { createTextStyles } from "@/constants/Text";

/**
 * StoredCredentialsScreen Component
 *
 * This component displays a list of stored credentials and allows the user
 * to connect using a selected credential or remove credentials.
 *
 * @returns {React.FC} A functional component for displaying stored credentials
 */
const StoredCredentialsScreen: React.FC = () => {
	// Access necessary functions and data from the connectivity context
	const { setUrl, setKey, handleConnect } = useConnectivity();
	const { storedCredentials, removeCredential } = useCredentials();

	// Set up color scheme and styles
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme || "light"];
	const inputs = createInputsStyles(colors);
	const containers = createContainerStyles(colors);
	const text = createTextStyles(colors);
	const [pendingConnect, setPendingConnect] = useState(false);

	/**
	 * Handles the press event on a credential item
	 * @param {string} url - The URL of the selected credential
	 * @param {string} key - The key of the selected credential
	 */
	useEffect(() => {
		if (pendingConnect) {
			handleConnect();
			setPendingConnect(false);
		}
	}, [pendingConnect]);

	const handleCredentialPress = (url: string, key: string) => {
		Alert.alert("Connect", "Do you want to connect using these credentials?", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Connect",
				onPress: () => {
					setUrl(url);
					setKey(key);
					setPendingConnect(true);
				},
			},
		]);
	};

	/**
	 * Handles the removal of a credential
	 * @param {string} id - The id of the credential to be removed
	 */
	const handleRemoveCredential = (id: string) => {
		Alert.alert("Remove Credential", "Are you sure you want to remove this credential?", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Remove",
				onPress: () => removeCredential(id),
				style: "destructive",
			},
		]);
	};

	/**
	 * Renders an individual credential item
	 * @param {Object} param0 - The item to be rendered
	 * @param {Credential} param0.item - The credential data
	 */
	const renderItem = ({ item }: { item: Credential }) => (
		<View style={[styles.credentialItem, { borderColor: colors.text }]}>
			<Pressable
				style={styles.credentialInfo}
				onPress={() => handleCredentialPress(item.url, item.key)}>
				<Text style={[text.textMd, text.textStrong, { color: colors.text }]}>{item.url}</Text>
				<Text style={[text.textSm, text.textOpaque, { color: colors.textSubtle }]}>
					{item.key.slice(0, 5)}...
				</Text>
			</Pressable>
			<Pressable
				style={[inputs.button, inputs.buttonDanger, inputs.buttonThin]}
				onPress={() => handleRemoveCredential(item.id)}>
				<Text style={inputs.buttonDangerText}>Remove</Text>
			</Pressable>
		</View>
	);

	return (
		<View style={containers.container}>
			<Text style={text.h2}>Stored Credentials</Text>
			{storedCredentials.length === 0 ? (
				<Text style={styles.noCredentials}>No stored credentials</Text>
			) : (
				<FlatList
					data={storedCredentials}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					style={[
						styles.credentialList,
						{
							borderColor: colors.textSubtle,
							backgroundColor: colors.background,
						},
					]}
				/>
			)}
		</View>
	);
};

// Styles specific to this component
const styles = StyleSheet.create({
	credentialList: {
		width: "100%",
	},
	credentialItem: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
		padding: 10,
		borderRadius: 5,
		borderWidth: 1,
	},
	credentialInfo: {
		width: "100%",
		marginBottom: 5,
	},
	noCredentials: {
		fontSize: 16,
		textAlign: "center",
		marginTop: 20,
	},
});

export default StoredCredentialsScreen;
