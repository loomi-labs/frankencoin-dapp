import Link from "next/link";
import dynamic from "next/dynamic";
import { formatUnits } from "viem";
import { usePoolStats } from "@hooks";
import { formatCurrency } from "../../utils/format";
import PortfolioDrawerSection from "./PortfolioDrawerSection";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

export default function PortfolioDrawerFps() {
	const { equityBalance, equityPrice } = usePoolStats();
	const has = equityBalance > 0n;

	const valueZchf = (equityBalance * equityPrice) / 10n ** 18n;

	return (
		<PortfolioDrawerSection title="FPS" count={has ? 1 : 0}>
			{!has ? (
				<div className="text-xs text-text-secondary py-1">No FPS holdings.</div>
			) : (
				<Link
					href="/equity"
					className="flex items-center gap-2 rounded-lg bg-card-content-primary px-2 py-2 hover:bg-menu-hover transition-colors"
				>
					<TokenLogo currency="FPS" size={6} />
					<div className="flex-1 min-w-0">
						<div className="text-sm font-medium text-text-primary">FPS</div>
						<div className="text-xs text-text-secondary font-mono">
							{formatCurrency(formatUnits(valueZchf, 18))} ZCHF
						</div>
					</div>
					<div className="text-sm font-mono text-text-primary">{formatCurrency(formatUnits(equityBalance, 18))}</div>
				</Link>
			)}
		</PortfolioDrawerSection>
	);
}
