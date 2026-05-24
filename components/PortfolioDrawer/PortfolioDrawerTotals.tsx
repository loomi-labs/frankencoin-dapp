import { useSelector } from "react-redux";
import { useConnection } from "wagmi";
import { Address, formatUnits, zeroAddress } from "viem";
import { mainnet } from "viem/chains";
import { ADDRESS } from "@frankencoin/zchf";
import { RootState } from "../../redux/redux.store";
import { formatCurrency, normalizeAddress } from "../../utils/format";

function Cell({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col rounded-lg bg-card-content-primary px-3 py-2">
			<div className="text-xs text-card-input-label">{label}</div>
			<div className="text-sm font-mono font-medium text-text-primary truncate">{value} ZCHF</div>
		</div>
	);
}

export default function PortfolioDrawerTotals({ account }: { account: Address }) {
	const positions = useSelector((state: RootState) => state.positions.openPositions);
	const prices = useSelector((state: RootState) => state.prices.coingecko);

	const owned = positions.filter((p) => normalizeAddress(p.owner) === normalizeAddress(account));

	let totalMinted = 0n;
	let totalReserves = 0n;
	let valueLockedChf = 0;

	for (const p of owned) {
		const minted = BigInt(p.minted);
		const reserve = BigInt(p.reserveContribution);
		totalMinted += minted;
		totalReserves += (minted * reserve) / 1_000_000n;

		const balance = parseFloat(formatUnits(BigInt(p.collateralBalance), p.collateralDecimals));
		const price = prices[normalizeAddress(p.collateral)]?.price?.chf ?? 0;
		valueLockedChf += balance * price;
	}

	const totalOwed = totalMinted - totalReserves;

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
