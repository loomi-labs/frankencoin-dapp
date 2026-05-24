import dynamic from "next/dynamic";
import { useRouter as useNavigation } from "next/navigation";
import { formatUnits } from "viem";
import { SwapVCHFStatsReturn } from "@hooks";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

interface Props {
	stats: SwapVCHFStatsReturn;
}

function formatCompact(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
	return n.toFixed(0);
}

export default function StablecoinBridgeCard({ stats }: Props) {
	const navigate = useNavigation();

	const bridgeLimit = stats.bridgeLimit;
	const bridgeUsed = stats.asCollateralOverview.minted;
	const total = Number(formatUnits(bridgeLimit, 18));
	const used = Number(formatUnits(bridgeUsed, 18));
	const pctRaw = bridgeLimit > 0n ? Number((bridgeUsed * 10000n) / bridgeLimit) / 100 : 0;
	const pct = Math.min(100, Math.max(0, pctRaw));

	const name = stats.asBorrowPosition.collateralName;
	const symbol = stats.asBorrowPosition.collateralSymbol;

	return (
		<div className="rounded-card border border-card-input-border bg-card-body-primary p-6 flex flex-col gap-5">
			<div className="flex items-center gap-4">
				<div className="relative flex-shrink-0">
					<TokenLogo currency={symbol} size={10} />
					<div className="absolute inset-0 rounded-full ring-1 ring-card-input-border pointer-events-none" />
				</div>
				<div className="flex flex-col min-w-0">
					<span className="font-display font-semibold text-[17px] tracking-tight text-text-primary truncate">{name}</span>
					<span className="font-mono uppercase tracking-wider text-xs text-text-secondary mt-0.5">{symbol}</span>
				</div>
			</div>

			<div className="border-t border-card-input-border pt-5">
				<div className="font-display text-[22px] font-medium tracking-tight text-text-primary">
					1 ZCHF <span className="text-text-secondary mx-0.5">≡</span> 1 {symbol}
				</div>
				<div className="text-sm text-text-secondary mt-1">Swap in either direction.</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-baseline justify-between">
					<span className="text-[11px] uppercase tracking-[0.12em] text-text-secondary">Bridged</span>
					<span className="font-mono text-sm text-text-primary">
						{formatCompact(used)} <span className="text-text-secondary">of {formatCompact(total)} ZCHF</span>
					</span>
				</div>
				<div className="h-[3px] rounded-[1px] bg-card-input-border overflow-hidden">
					<div className="h-full bg-button-default transition-[width] duration-300" style={{ width: `${pct}%` }} />
				</div>
			</div>

			<div className="flex justify-end">
				<button
					type="button"
					onClick={() => navigate.push(stats.swapUrl)}
					className="group inline-flex items-center gap-1.5 text-text-active text-[14px] font-semibold cursor-pointer transition-[gap] duration-150 ease-out hover:gap-2.5"
				>
					Swap
					<span className="transition-transform duration-150 ease-out group-hover:translate-x-1" aria-hidden>
						→
					</span>
				</button>
			</div>
		</div>
	);
}
