import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
			}}>
			<Tabs.Screen
				name="record"
				options={{
					title: "Record",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "mic-circle" : "mic-circle-outline"}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="machines"
				options={{
					title: "Machines",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "game-controller" : "game-controller-outline"}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
