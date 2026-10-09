import dynamic from "next/dynamic";
import { Address, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { useConnection } from "wagmi";
import { useFCSHolding, useUserBalance } from "@hooks";
import { formatCurrency } from "../../utils/format";
import AppCard from "@components/AppCard";
import AppButton from "@components/AppButton";
import AppButtonSecondary from "@components/AppButtonSecondary";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

export default function MyPortfolioFcsCard({ account }: { account: Address }) {
	const { address } = useConnection();
	const balances = useUserBalance(account);
	const fcsBalance = balances[mainnet.id]?.fcs ?? 0n;
	const fpsBalance = balances[mainnet.id]?.equity ?? 0n;
	// FCS wraps FPS 1:1, so the FPS price values both tokens.
	const { equityPrice, fcsHoldingDuration } = useFCSHolding(account);

	const isOwnAccount = address?.toLowerCase() === account.toLowerCase();
	const has = fcsBalance > 0n;
	const hasFps = fpsBalance > 0n;
	const valueZchf = (fcsBalance * equityPrice) / 10n ** 18n;
	const fpsValueZchf = (fpsBalance * equityPrice) / 10n ** 18n;
	const holdingDays = Number(fcsHoldingDuration) / 60 / 60 / 24;

	return (
		<AppCard>
			<div className="flex items-center gap-3">
				<TokenLogo currency="FCS" size={8} />
				<div className="flex-1">
					<div className="text-sm text-text-secondary">Frankencoin Shares</div>
					<div className="text-lg font-display font-semibold text-text-primary">
						FCS
						{has && (
							<span className="ml-2 text-sm font-normal text-text-secondary">
								· {holdingDays > 0 ? `Held for ${Math.round(holdingDays)} days` : "Newly acquired"}
							</span>
						)}
					</div>
				</div>
			</div>

			{!has ? (
				<div className="text-sm text-text-secondary">No FCS holdings.</div>
			) : (
				<>
					<div className="flex flex-col rounded-lg bg-card-content-primary px-3 py-2">
						<div className="text-xs text-card-input-label">Balance</div>
						<div className="text-xl font-mono font-medium text-text-primary">
							{formatCurrency(formatUnits(fcsBalance, 18))} FCS
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

			{hasFps && (
				<div className="flex flex-col gap-2 rounded-lg border border-button-default bg-card-content-primary px-3 py-3">
					<div className="text-sm text-text-primary">
						You hold {formatCurrency(formatUnits(fpsBalance, 18))} FPS (≈ {formatCurrency(formatUnits(fpsValueZchf, 18))} ZCHF).
						FCS replaces FPS. Migrate your FPS to FCS 1:1.
					</div>
					{isOwnAccount && (
						<AppButton to="/equity?from=FPS&to=FCS" size="medium">
							Migrate to FCS
						</AppButton>
					)}
				</div>
			)}

			<AppButtonSecondary to="/equity" size="medium" className="mt-auto">
				Manage FCS
			</AppButtonSecondary>
		</AppCard>
	);
}
