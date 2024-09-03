import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ConnectivityProvider } from "@/contexts/ConnectivityContext";
import { CredentialsProvider } from "@/contexts/CredentialsContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<SafeAreaProvider>
				<CredentialsProvider>
					<ConnectivityProvider>
						<Stack initialRouteName="startup">
							<Stack.Screen
								name="settings/connect"
								options={{ headerShown: false }}
							/>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						</Stack>
					</ConnectivityProvider>
				</CredentialsProvider>
			</SafeAreaProvider>
		</ThemeProvider>
	);
}
