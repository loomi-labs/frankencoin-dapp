import { Address } from "viem";
import MyPortfolioSavingsCard from "./MyPortfolioSavingsCard";
import MyPortfolioFpsCard from "./MyPortfolioFpsCard";
import MyPortfolioWalletCard from "./MyPortfolioWalletCard";

export default function MyPortfolioHoldingsGrid({ account }: { account: Address }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<MyPortfolioSavingsCard account={account} />
			<MyPortfolioFpsCard />
			<MyPortfolioWalletCard account={account} />
		</div>
	);
}
