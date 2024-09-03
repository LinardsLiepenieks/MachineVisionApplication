// src/contexts/CredentialsContext.tsx
import React, {
	createContext,
	useState,
	useContext,
	ReactNode,
	useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";

export interface Credential {
	id: string;
	url: string;
	key: string;
}

interface CredentialsContextType {
	storedCredentials: Credential[];
	loadCredentials: () => Promise<void>;
	addCredential: (url: string, key: string) => Promise<void>;
	removeCredential: (id: string) => Promise<void>;
}

const CredentialsContext = createContext<CredentialsContextType | undefined>(
	undefined
);

interface CredentialsProviderProps {
	children: ReactNode;
}

const STORAGE_KEY = "connectivity_credentials";

export const CredentialsProvider: React.FC<CredentialsProviderProps> = ({
	children,
}) => {
	const [storedCredentials, setStoredCredentials] = useState<Credential[]>([]);

	useEffect(() => {
		loadCredentials();
	}, []);

	const loadCredentials = async () => {
		try {
			const credentialsJson = await SecureStore.getItemAsync(STORAGE_KEY);
			if (credentialsJson) {
				setStoredCredentials(JSON.parse(credentialsJson));
			}
		} catch (error) {
			console.error("Error loading credentials:", error);
		}
	};

	const addCredential = async (url: string, key: string) => {
		const existingCredentialIndex = storedCredentials.findIndex(
			(cred) => cred.key === key
		);

		if (existingCredentialIndex !== -1) {
			// Update the existing credential
			const updatedCredentials = [...storedCredentials];
			updatedCredentials[existingCredentialIndex] = {
				...updatedCredentials[existingCredentialIndex],
				url,
			};
			setStoredCredentials(updatedCredentials);
			await SecureStore.setItemAsync(
				STORAGE_KEY,
				JSON.stringify(updatedCredentials)
			);
		} else {
			// Add a new credential
			const newCredential: Credential = {
				id: Date.now().toString(), // Simple unique id
				url,
				key,
			};
			const updatedCredentials = [...storedCredentials, newCredential];
			setStoredCredentials(updatedCredentials);
			await SecureStore.setItemAsync(
				STORAGE_KEY,
				JSON.stringify(updatedCredentials)
			);
		}
	};

	const removeCredential = async (id: string) => {
		const updatedCredentials = storedCredentials.filter(
			(cred) => cred.id !== id
		);
		setStoredCredentials(updatedCredentials);
		await SecureStore.setItemAsync(
			STORAGE_KEY,
			JSON.stringify(updatedCredentials)
		);
	};

	return (
		<CredentialsContext.Provider
			value={{
				storedCredentials,
				loadCredentials,
				addCredential,
				removeCredential,
			}}>
			{children}
		</CredentialsContext.Provider>
	);
};

export const useCredentials = (): CredentialsContextType => {
	const context = useContext(CredentialsContext);
	if (context === undefined) {
		throw new Error("useCredentials must be used within a CredentialsProvider");
	}
	return context;
};
