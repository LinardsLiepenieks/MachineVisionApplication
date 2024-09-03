// screens/MachinesScreen.tsx
import React, { useCallback } from "react";
import { View, FlatList, StyleSheet, Pressable, Text } from "react-native";
import Machine from "@/components/Machines/Machine";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { createInputsStyles } from "@/constants/Inputs";
import { createContainerStyles } from "@/constants/Containers";
import { createTextStyles } from "@/constants/Text";
import { useConnectivity } from "@/contexts/ConnectivityContext";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

type MachineData = {
	id: string;
	name: string;
	state: string;
};

type MachineComponentState = "Connect" | "Disconnect" | "Offline" | "Busy";

const MachinesScreen: React.FC = () => {
	const {
		machines,
		sendReloadMachinesMessage,
		sendConnectToMachineMessage,
		sendDisconnectFromMachineMessage,
	} = useConnectivity();
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme || "light"];
	const containers = createContainerStyles(colors);
	const text = createTextStyles(colors);

	useFocusEffect(
		useCallback(() => {
			sendReloadMachinesMessage();
		}, [])
	);

	const handleMachinePress = (key: string, state: string) => {
		// In a real app, you would handle the state change here
		switch (state) {
			case "Connect":
				sendConnectToMachineMessage(key);
				break;
			case "Disconnect":
				sendDisconnectFromMachineMessage(key);
				break;
			//sendDisconnectFromMachineMessage(key);
			default:
				return;
		}
	};

	const mapMachineState = (state: string): MachineComponentState => {
		switch (state) {
			case "Connect":
				return "Connect";
			case "Disconnect":
				return "Disconnect";
			case "Busy":
				return "Busy";
			default:
				return "Offline";
		}
	};

	return (
		<View style={containers.container}>
			<View
				style={[
					containers.topContainer,
					{
						width: "100%",
						justifyContent: "space-between",
					}, // Removed alignItems here
				]}>
				{/* Centering container */}

				<Text style={[text.h2, { marginBottom: 0, color: colors.text }]}>
					Machines
				</Text>

				{/* Refresh button */}
				<Pressable onPress={sendReloadMachinesMessage}>
					<FontAwesome
						name="refresh"
						size={24}
						color={colorScheme === "dark" ? "white" : "black"}
					/>
				</Pressable>
			</View>
			<FlatList
				style={styles.list}
				data={machines}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<Machine
						name={item.name}
						state={mapMachineState(item.state)}
						key={item.key}
						onPress={() => handleMachinePress(item.key.toString(), item.state)}
					/>
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	list: {
		width: "100%",
	},
});

export default MachinesScreen;
