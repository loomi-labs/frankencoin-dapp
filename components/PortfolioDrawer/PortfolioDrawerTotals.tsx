import { Address, formatUnits } from "viem";
import { usePortfolioTotals } from "@hooks";
import { formatCurrency } from "../../utils/format";

function Cell({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col rounded-lg bg-card-content-primary px-3 py-2">
			<div className="text-xs text-card-input-label">{label}</div>
			<div className="text-sm font-mono font-medium text-text-primary truncate">{value} ZCHF</div>
		</div>
	);
}

export default function PortfolioDrawerTotals({ account }: { account: Address }) {
	const { totalOwed, totalMinted, totalReserves, valueLockedChf } = usePortfolioTotals(account);

	return (
		<section className="bg-card-body-primary rounded-card border border-card-input-border p-3">
			<div className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Portfolio totals</div>
			<div className="grid grid-cols-2 gap-2">
				<Cell label="Owed" value={formatCurrency(formatUnits(totalOwed, 18)) || "0.00"} />
				<Cell label="Minted" value={formatCurrency(formatUnits(totalMinted, 18)) || "0.00"} />
				<Cell label="Reserves" value={formatCurrency(formatUnits(totalReserves, 18)) || "0.00"} />
				<Cell label="Value locked" value={formatCurrency(valueLockedChf) || "0.00"} />
			</div>
		</section>
	);
}
