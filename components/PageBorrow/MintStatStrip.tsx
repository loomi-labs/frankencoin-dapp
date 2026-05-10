import { useSelector } from "react-redux";
import { formatUnits } from "viem";
import { RootState } from "../../redux/redux.store";
import { formatCurrency, FormatType, normalizeAddress } from "@utils";
import { useBorrowPositions } from "@hooks";

interface StatProps {
	label: string;
	value: string;
}

function Stat({ label, value }: StatProps) {
	return (
		<div className="px-5 py-4 first:pl-6 last:pr-6 md:border-r border-card-input-border last:border-r-0 max-md:border-b max-md:last:border-b-0">
			<div className="text-[11px] uppercase tracking-[0.08em] font-medium text-text-secondary">{label}</div>
			<div className="mt-1.5 text-xl md:text-2xl font-mono font-medium tracking-tight text-text-primary">{value}</div>
		</div>
	);
}

export default function MintStatStrip() {
	const { coingecko } = useSelector((state: RootState) => state.prices);
	const { matchingPositions } = useBorrowPositions();

	let totalCollateralChf = 0;
	let totalMinted = 0;
	let weightedInterest = 0;
	let interestWeight = 0;

	matchingPositions.forEach((p) => {
		const collAddr = normalizeAddress(p.collateral);
		const collPriceChf = coingecko[collAddr]?.price?.chf || coingecko[collAddr]?.price?.usd || 0;
		const collBalance = parseFloat(formatUnits(BigInt(p.collateralBalance ?? "0"), p.collateralDecimals));
		totalCollateralChf += collBalance * collPriceChf;

		const minted = parseFloat(formatUnits(BigInt(p.minted ?? "0"), 18));
		totalMinted += minted;

		const effectiveInterest = p.annualInterestPPM / 1e4 / (1 - p.reserveContribution / 1e6);
		weightedInterest += effectiveInterest * minted;
		interestWeight += minted;
	});

	const avgInterest = interestWeight > 0 ? weightedInterest / interestWeight : 0;
	const positionsCount = matchingPositions.length;

	const stats: StatProps[] = [
		{ label: "Total collateral", value: `CHF ${formatCurrency(totalCollateralChf, 0, 0) ?? "0"}` },
		{ label: "Outstanding", value: `ZCHF ${formatCurrency(totalMinted, 0, 0) ?? "0"}` },
		{ label: "Avg interest", value: `${formatCurrency(avgInterest, 2, 2) ?? "0.00"}%` },
		{ label: "Borrowable positions", value: formatCurrency(positionsCount, 0, 0, FormatType.us) ?? "0" },
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-4 bg-card-body-primary rounded-card border border-card-input-border shadow-card dark:shadow-none overflow-hidden">
			{stats.map((s) => (
				<Stat key={s.label} label={s.label} value={s.value} />
			))}
		</div>
	);
}
