import { useSelector } from "react-redux";
import Link from "next/link";
import { Address, formatUnits, zeroAddress } from "viem";
import dynamic from "next/dynamic";
import { RootState } from "../../redux/redux.store";
import { formatCurrency } from "../../utils/format";
import { useSavingsAccruedInterest } from "@hooks";
import PortfolioDrawerSection from "./PortfolioDrawerSection";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

export default function PortfolioDrawerSavings({ account }: { account: Address }) {
	const savingsBalance = useSelector((state: RootState) => state.savings.savingsBalance);
	const { total: pendingInterest } = useSavingsAccruedInterest(account === zeroAddress ? undefined : account);

	let balance = 0n;

	if (account !== zeroAddress && savingsBalance) {
		for (const chainModules of Object.values(savingsBalance)) {
			if (!chainModules) continue;
			for (const entry of Object.values(chainModules)) {
				if (!entry) continue;
				try {
					balance += BigInt(entry.balance ?? "0");
				} catch {
					// skip malformed entries
				}
			}
		}
	}

	const hasSavings = balance > 0n || pendingInterest > 0n;
	const canCollect = pendingInterest > 0n;

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
							{canCollect ? `+${formatCurrency(formatUnits(pendingInterest, 18))} to collect` : "no pending interest"}
						</div>
					</div>
					<div className="flex flex-col items-end gap-1">
						<div className="text-sm font-mono text-text-primary">{formatCurrency(formatUnits(balance, 18))}</div>
						{canCollect && (
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
								Collect
							</span>
						)}
					</div>
				</Link>
			)}
		</PortfolioDrawerSection>
	);
}
