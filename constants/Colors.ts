/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
	light: {
		text: "#11181C",
		textSubtle: "#737678",
		textInverted: "#eee7e3",
		background: "#fff",
		tint: tintColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
		danger: "red",
		warning: "yellow",
		success: "green",
	},
	dark: {
		text: "#ECEDEE",
		textSubtle: "#969a9e",
		textInverted: "#eee7e3",
		background: "#151718",
		tint: tintColorDark,
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,
		danger: "red",
		warning: "yellow",
		success: "green",
	},
};

export type ColorScheme = keyof typeof Colors;
export type ColorSet = (typeof Colors)[ColorScheme];
