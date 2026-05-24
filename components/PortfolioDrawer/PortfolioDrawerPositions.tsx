import { useSelector } from "react-redux";
import Link from "next/link";
import { Address, formatUnits } from "viem";
import dynamic from "next/dynamic";
import { RootState } from "../../redux/redux.store";
import { formatCurrency, normalizeAddress } from "../../utils/format";
import PortfolioDrawerSection from "./PortfolioDrawerSection";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

function StateBadge({ position }: { position: { closed: boolean; denied: boolean; cooldown: number; expiration: number } }) {
	const now = Date.now();
	const isClosed = position.closed || position.denied;
	const isCooldown = !isClosed && position.cooldown * 1000 > now;
	const expiresInDays = (position.expiration * 1000 - now) / 1000 / 60 / 60 / 24;
	const isExpiring = !isClosed && !isCooldown && expiresInDays > 0 && expiresInDays < 7;

	const { label, tone } = isClosed
		? { label: "Closed", tone: "bg-red-500/15 text-red-500 dark:text-red-400" }
		: isCooldown
		? { label: "Cooldown", tone: "bg-amber-500/15 text-amber-500 dark:text-amber-400" }
		: isExpiring
		? { label: "Expiring", tone: "bg-amber-500/15 text-amber-500 dark:text-amber-400" }
		: { label: "Open", tone: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400" };

	return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{label}</span>;
}

export default function PortfolioDrawerPositions({ account }: { account: Address }) {
	const positions = useSelector((state: RootState) => state.positions.openPositions);
	const owned = positions.filter((p) => normalizeAddress(p.owner) === normalizeAddress(account));

	return (
		<PortfolioDrawerSection title="Positions" count={owned.length}>
			{owned.length === 0 ? (
				<div className="text-xs text-text-secondary py-1">No open positions.</div>
			) : (
				owned.map((p) => (
					<Link
						key={p.position}
						href={`/mypositions/${p.position}`}
						className="flex items-center gap-2 rounded-lg bg-card-content-primary px-2 py-2 hover:bg-menu-hover transition-colors"
					>
						<TokenLogo currency={p.collateralSymbol} size={6} />
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-text-primary truncate">{p.collateralSymbol}</div>
							<div className="text-xs text-text-secondary font-mono">
								{formatCurrency(formatUnits(BigInt(p.minted), 18))} ZCHF
							</div>
						</div>
						<StateBadge position={p} />
					</Link>
				))
			)}
		</PortfolioDrawerSection>
	);
}
