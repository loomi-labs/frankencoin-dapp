import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { Address, formatUnits, zeroAddress } from "viem";
import { useSavingsAccruedInterest } from "@hooks";
import { RootState } from "../../redux/redux.store";
import { formatCurrency } from "../../utils/format";
import AppCard from "@components/AppCard";
import AppButtonSecondary from "@components/AppButtonSecondary";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

export default function MyPortfolioSavingsCard({ account }: { account: Address }) {
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
		<AppCard>
			<div className="flex items-center gap-3">
				<TokenLogo currency="ZCHF" size={8} />
				<div className="flex-1">
					<div className="text-sm text-text-secondary">Savings</div>
					<div className="text-lg font-display font-semibold text-text-primary">ZCHF saved</div>
				</div>
			</div>

			{!hasSavings ? (
				<div className="text-sm text-text-secondary">No active savings deposit.</div>
			) : (
				<>
					<div className="flex flex-col rounded-lg bg-card-content-primary px-3 py-2">
						<div className="text-xs text-card-input-label">Balance</div>
						<div className="text-xl font-mono font-medium text-text-primary">
							{formatCurrency(formatUnits(balance, 18))} ZCHF
						</div>
					</div>

					<div className="flex flex-col rounded-lg bg-card-content-primary px-3 py-2">
						<div className="text-xs text-card-input-label">Pending interest</div>
						<div className="flex items-center gap-2">
							<div className="flex-1 text-xl font-mono font-medium text-text-primary">
								{canCollect ? `+${formatCurrency(formatUnits(pendingInterest, 18))}` : "0.00"} ZCHF
							</div>
						</div>
					</div>
				</>
			)}

			<AppButtonSecondary to="/savings" size="medium" className="mt-auto">
				{canCollect ? "Collect interest" : "Manage savings"}
			</AppButtonSecondary>
		</AppCard>
	);
}
