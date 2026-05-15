"use client";
import "../styles/globals.css";
import "../styles/datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import Script from "next/script";

import Layout from "@components/Layout";
import NextSeoProvider from "@components/NextSeoProvider";
import ThemeProvider from "@components/ThemeProvider";
import { ApolloProvider } from "@apollo/client";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer } from "react-toastify";
import Web3ModalProvider from "@components/Web3Modal";
import { store } from "../redux/redux.store";
import { MORPHOGRAPH_CLIENT, PONDER_CLIENT } from "../app.config";
import BlockUpdater from "@components/BlockUpdater";
import USGovSanctionList from "@components/USGovSanctionList";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Script
				src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
				data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
				strategy="afterInteractive"
			/>

			<ThemeProvider>
				<ReduxProvider store={store}>
					<Web3ModalProvider>
						<ApolloProvider client={MORPHOGRAPH_CLIENT}>
							<ApolloProvider client={PONDER_CLIENT}>
								<ToastContainer
									className="border-card-input-border border bg-card-body-primary rounded-card"
									toastClassName={(c) => "bg-card-body-primary text-text-primary rounded-card"}
									position="bottom-right"
									hideProgressBar={false}
									rtl={false}
									closeButton={false}
								/>

								<BlockUpdater>
									<NextSeoProvider />
									<USGovSanctionList />
									<Layout>
										<Component {...pageProps} />
									</Layout>
								</BlockUpdater>
							</ApolloProvider>
						</ApolloProvider>
					</Web3ModalProvider>
				</ReduxProvider>
			</ThemeProvider>
		</>
	);
}
