import dynamic from "next/dynamic";
import { formatUnits } from "viem";
import { usePoolStats } from "@hooks";
import { formatCurrency } from "../../utils/format";
import AppCard from "@components/AppCard";
import AppButtonSecondary from "@components/AppButtonSecondary";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

export default function MyPortfolioFpsCard() {
	const { equityBalance, equityPrice, equityHoldingDuration } = usePoolStats();
	const has = equityBalance > 0n;
	const valueZchf = (equityBalance * equityPrice) / 10n ** 18n;
	const holdingDays = Number(equityHoldingDuration) / 60 / 60 / 24;

	return (
		<AppCard>
			<div className="flex items-center gap-3">
				<TokenLogo currency="FPS" size={8} />
				<div className="flex-1">
					<div className="text-sm text-text-secondary">Pool shares</div>
					<div className="text-lg font-display font-semibold text-text-primary">
						FPS
						{has && (
							<span className="ml-2 text-sm font-normal text-text-secondary">
								· {holdingDays > 0 ? `Held for ${Math.round(holdingDays)} days` : "Newly acquired"}
							</span>
						)}
					</div>
				</div>
			</div>

			{!has ? (
				<div className="text-sm text-text-secondary">No FPS holdings.</div>
			) : (
				<>
					<div className="flex flex-col rounded-lg bg-card-content-primary px-3 py-2">
						<div className="text-xs text-card-input-label">Balance</div>
						<div className="text-xl font-mono font-medium text-text-primary">
							{formatCurrency(formatUnits(equityBalance, 18))} FPS
						</div>
					</div>

					<div className="flex flex-col rounded-lg bg-card-content-primary px-3 py-2">
						<div className="text-xs text-card-input-label">Value</div>
						<div className="text-xl font-mono font-medium text-text-primary">
							{formatCurrency(formatUnits(valueZchf, 18))} ZCHF
						</div>
					</div>
				</>
			)}

			<AppButtonSecondary to="/equity" size="medium" className="mt-auto">
				Manage FPS
			</AppButtonSecondary>
		</AppCard>
	);
}
