"use client";

import React, { ReactNode, useEffect } from "react";
import { WAGMI_CONFIG, CONFIG, WAGMI_ADAPTER, WAGMI_METADATA, WAGMI_CHAINS, WAGMI_CHAIN } from "../app.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Config, State, WagmiProvider } from "wagmi";
import { createAppKit, useAppKitTheme } from "@reown/appkit/react";
import { useTheme } from "@hooks";

const queryClient = new QueryClient();
if (!CONFIG.wagmiId) throw new Error("Project ID is not defined");

createAppKit({
	adapters: [WAGMI_ADAPTER],
	projectId: CONFIG.wagmiId,
	// @ts-ignore
	networks: WAGMI_CHAINS,
	defaultNetwork: WAGMI_CHAIN,
	metadata: WAGMI_METADATA,
	features: {
		analytics: true,
	},
});

function AppKitThemeSync() {
	const [mode] = useTheme();
	const { setThemeMode, setThemeVariables } = useAppKitTheme();

	useEffect(() => {
		setThemeMode(mode);
		setThemeVariables(
			mode === "dark"
				? { "--w3m-color-mix": "#15102A", "--w3m-color-mix-strength": 20, "--w3m-accent": "#8B5CF6" }
				: { "--w3m-color-mix": "#ffffff", "--w3m-color-mix-strength": 40, "--w3m-accent": "#6D28D9" }
		);
	}, [mode, setThemeMode, setThemeVariables]);

	return null;
}

export default function Web3ModalProvider({ children, initialState }: { children: ReactNode; initialState?: State }) {
	return (
		<WagmiProvider config={WAGMI_CONFIG as Config} initialState={initialState}>
			<QueryClientProvider client={queryClient}>
				<AppKitThemeSync />
				{children}
			</QueryClientProvider>
		</WagmiProvider>
	);
}
