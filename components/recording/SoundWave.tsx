import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

interface SoundWaveProps {
	isRecording: boolean;
}

const BAR_COUNT = 5;

const SoundWave: React.FC<SoundWaveProps> = ({ isRecording }) => {
	const animations = useRef(
		new Array(BAR_COUNT).fill(0).map(() => new Animated.Value(0))
	).current;

	useEffect(() => {
		if (isRecording) {
			Animated.loop(
				Animated.stagger(
					100,
					animations.map((anim) =>
						Animated.sequence([
							Animated.timing(anim, {
								toValue: 1,
								duration: 300,
								useNativeDriver: true,
								easing: Easing.sin,
							}),
							Animated.timing(anim, {
								toValue: 0,
								duration: 300,
								useNativeDriver: true,
								easing: Easing.sin,
							}),
						])
					)
				)
			).start();
		} else {
			animations.forEach((anim) => {
				anim.stopAnimation();
				anim.setValue(0);
			});
		}
	}, [isRecording]);

	return (
		<View style={styles.container}>
			{animations.map((anim, index) => (
				<Animated.View
					key={index}
					style={[
						styles.bar,
						{
							transform: [
								{
									scaleY: anim.interpolate({
										inputRange: [0, 1],
										outputRange: [0.3, 1],
									}),
								},
							],
						},
					]}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		height: 50,
		width: "100%",
	},
	bar: {
		width: 3,
		height: "100%",
		backgroundColor: "white",
		borderRadius: 5,
	},
});

export default SoundWave;
