"use client";

import React, { ReactNode, useEffect } from "react";
import { WAGMI_CONFIG, CONFIG, WAGMI_ADAPTER, WAGMI_METADATA, WAGMI_CHAINS, WAGMI_CHAIN } from "../app.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Config, State, WagmiProvider } from "wagmi";
import { createAppKit, useAppKitTheme } from "@reown/appkit/react";
import { AppKitNetwork } from "@reown/appkit/networks";
import { useTheme } from "@hooks";

const queryClient = new QueryClient();
if (!CONFIG.wagmiId) throw new Error("Project ID is not defined");

createAppKit({
	adapters: [WAGMI_ADAPTER],
	projectId: CONFIG.wagmiId,
	// @ts-ignore
	networks: WAGMI_CHAINS,
	defaultNetwork: WAGMI_CHAIN as AppKitNetwork,
	metadata: WAGMI_METADATA,
	features: {
		analytics: true,
	},
});

const DARK_THEME_VARS = { "--w3m-color-mix": "#10161D", "--w3m-color-mix-strength": 20, "--w3m-accent": "#E0584D" } as const;
const LIGHT_THEME_VARS = { "--w3m-color-mix": "#ffffff", "--w3m-color-mix-strength": 40, "--w3m-accent": "#DA291C" } as const;

function AppKitThemeSync() {
	const [mode] = useTheme();
	const { setThemeMode, setThemeVariables } = useAppKitTheme();

	useEffect(() => {
		setThemeMode(mode);
		setThemeVariables(mode === "dark" ? DARK_THEME_VARS : LIGHT_THEME_VARS);
		// setThemeMode/setThemeVariables are recreated on every render by
		// useAppKitTheme; including them here would loop with AppKit's
		// internal theme subscription.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

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
