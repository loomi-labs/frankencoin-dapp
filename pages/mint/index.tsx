import Head from "next/head";
import Link from "next/link";
import BorrowTable from "@components/PageBorrow/BorrowTable";
import StablecoinBridges from "@components/PageBorrow/StablecoinBridges";
import { useEffect } from "react";
import { store } from "../../redux/redux.store";
import { fetchPositionsList } from "../../redux/slices/positions.slice";
import AppTitle from "@components/AppTitle";
import AppHeroSteps from "@components/AppHeroSteps";
import AppButtonSecondary from "@components/AppButtonSecondary";
import { Icon } from "@iconify/react";
import HandMoneyIcon from "@components/icons/HandMoneyIcon";

export default function Borrow() {
	useEffect(() => {
		store.dispatch(fetchPositionsList());
	}, []);

	return (
		<>
			<Head>
				<title>Frankencoin - Get ZCHF</title>
			</Head>

			<AppTitle
				hero
				title="Get Frankencoins"
				subtitle="Deposit a collateral and mint new Frankencoins against it. The collateral stays locked until you return the minted coins."
			>
				<AppHeroSteps
					nested
					steps={[
						{
							icon: <Icon icon="solar:wallet-linear" />,
							title: "Choose a collateral",
							description: "Choose a crypto asset to use as collateral.",
						},
						{
							icon: <Icon icon="solar:checklist-minimalistic-linear" />,
							title: "Define terms",
							description: "Adjust amount, maturity, and liquidation price to your liking.",
						},
						{
							icon: <HandMoneyIcon />,
							title: "Receive Frankencoins",
							description: "Fresh Frankencoins are minted directly into your wallet.",
						},
					]}
				/>
			</AppTitle>

			<AppTitle
				title="Stablecoin bridges"
				subtitle="1:1 swaps between ZCHF and other Swiss-franc stablecoins."
			/>

			<StablecoinBridges />

			<AppTitle
				title="Collaterals"
				subtitle="Mint Frankencoins against crypto, tokenized securities, or commodities."
			/>

			<div className="mt-2">
				<BorrowTable />
			</div>

			<div className="flex items-center justify-center mt-6">
				<Link href={"mint/create"}>
					<AppButtonSecondary>Propose New Position or Collateral</AppButtonSecondary>
				</Link>
			</div>
		</>
	);
}
