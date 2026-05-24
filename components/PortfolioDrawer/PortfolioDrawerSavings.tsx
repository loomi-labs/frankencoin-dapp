import { useSelector } from "react-redux";
import Link from "next/link";
import { Address, formatUnits, zeroAddress } from "viem";
import dynamic from "next/dynamic";
import { RootState } from "../../redux/redux.store";
import { formatCurrency } from "../../utils/format";
import PortfolioDrawerSection from "./PortfolioDrawerSection";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

export default function PortfolioDrawerSavings({ account }: { account: Address }) {
	const savingsBalance = useSelector((state: RootState) => state.savings.savingsBalance);

	let balance = 0n;
	let interest = 0n;

	if (account !== zeroAddress && savingsBalance) {
		for (const chainModules of Object.values(savingsBalance)) {
			if (!chainModules) continue;
			for (const entry of Object.values(chainModules)) {
				if (!entry) continue;
				try {
					balance += BigInt(entry.balance ?? "0");
					interest += BigInt(entry.interest ?? "0");
				} catch {
					// skip malformed entries
				}
			}
		}
	}

	const hasSavings = balance > 0n || interest > 0n;

	return (
		<PortfolioDrawerSection title="Savings" count={hasSavings ? 1 : 0}>
			{!hasSavings ? (
				<div className="text-xs text-text-secondary py-1">No active savings deposit.</div>
			) : (
				<Link
					href="/savings"
					className="flex items-center gap-2 rounded-lg bg-card-content-primary px-2 py-2 hover:bg-menu-hover transition-colors"
				>
					<TokenLogo currency="ZCHF" size={6} />
					<div className="flex-1 min-w-0">
						<div className="text-sm font-medium text-text-primary">ZCHF saved</div>
						<div className="text-xs text-text-secondary font-mono">
							+{formatCurrency(formatUnits(interest, 18))} interest
						</div>
					</div>
					<div className="text-sm font-mono text-text-primary">{formatCurrency(formatUnits(balance, 18))}</div>
				</Link>
			)}
		</PortfolioDrawerSection>
	);
}
