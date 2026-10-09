import Link from "next/link";
import dynamic from "next/dynamic";
import { formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { useFCSHolding, useUserBalance } from "@hooks";
import { formatCurrency } from "../../utils/format";
import PortfolioDrawerSection from "./PortfolioDrawerSection";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

const rowClass = "flex items-center gap-2 rounded-lg bg-card-content-primary px-2 py-2 hover:bg-menu-hover transition-colors";

export default function PortfolioDrawerFcs() {
	const balances = useUserBalance();
	// FCS wraps FPS 1:1, so the FPS price values both tokens.
	const { equityPrice } = useFCSHolding();
	const fcsBalance = balances[mainnet.id]?.fcs ?? 0n;
	const fpsBalance = balances[mainnet.id]?.equity ?? 0n;
	const hasFcs = fcsBalance > 0n;
	const hasFps = fpsBalance > 0n;

	const valueZchf = (fcsBalance * equityPrice) / 10n ** 18n;

	return (
		<PortfolioDrawerSection title="FCS" count={Number(hasFcs) + Number(hasFps)}>
			{!hasFcs && !hasFps && <div className="text-xs text-text-secondary py-1">No FCS holdings.</div>}
			{hasFcs && (
				<Link href="/equity" className={rowClass}>
					<TokenLogo currency="FCS" size={6} />
					<div className="flex-1 min-w-0">
						<div className="text-sm font-medium text-text-primary">FCS</div>
						<div className="text-xs text-text-secondary font-mono">{formatCurrency(formatUnits(valueZchf, 18))} ZCHF</div>
					</div>
					<div className="text-sm font-mono text-text-primary">{formatCurrency(formatUnits(fcsBalance, 18))}</div>
				</Link>
			)}
			{hasFps && (
				<Link href="/equity?from=FPS&to=FCS" className={rowClass}>
					<TokenLogo currency="FPS" size={6} />
					<div className="flex-1 min-w-0">
						<div className="text-sm font-medium text-text-primary">FPS</div>
						<div className="text-xs text-link">Migrate to FCS →</div>
					</div>
					<div className="text-sm font-mono text-text-primary">{formatCurrency(formatUnits(fpsBalance, 18))}</div>
				</Link>
			)}
		</PortfolioDrawerSection>
	);
}
