import { Address } from "viem";
import MyPortfolioSavingsCard from "./MyPortfolioSavingsCard";
import MyPortfolioFcsCard from "./MyPortfolioFcsCard";
import MyPortfolioWalletCard from "./MyPortfolioWalletCard";

export default function MyPortfolioHoldingsGrid({ account }: { account: Address }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<MyPortfolioSavingsCard account={account} />
			<MyPortfolioFcsCard account={account} />
			<MyPortfolioWalletCard account={account} />
		</div>
	);
}
