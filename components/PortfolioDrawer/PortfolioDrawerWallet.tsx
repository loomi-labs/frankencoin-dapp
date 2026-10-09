import dynamic from "next/dynamic";
import { formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { useUserBalance } from "@hooks";
import { formatCurrency } from "../../utils/format";
import AppLink from "@components/AppLink";
import PortfolioDrawerSection from "./PortfolioDrawerSection";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

type Row = { symbol: string; amount: bigint };

function Item({ symbol, amount, migrate }: Row & { migrate?: boolean }) {
	return (
		<div className="flex items-center gap-2 rounded-lg bg-card-content-primary px-2 py-2">
			<TokenLogo currency={symbol} size={6} />
			<div className="flex-1 text-sm font-medium text-text-primary">{symbol}</div>
			<div className="text-sm font-mono text-text-primary">{formatCurrency(formatUnits(amount, 18))}</div>
			{migrate && <AppLink label="Migrate" href="/equity?from=FPS&to=FCS" icon className="flex items-center text-xs" />}
		</div>
	);
}

export default function PortfolioDrawerWallet() {
	const balances = useUserBalance();
	const zchf = balances[mainnet.id]?.frankencoin ?? 0n;
	const fcs = balances[mainnet.id]?.fcs ?? 0n;
	const fps = balances[mainnet.id]?.equity ?? 0n;

	const rows: Row[] = [];
	if (zchf > 0n) rows.push({ symbol: "ZCHF", amount: zchf });
	if (fcs > 0n) rows.push({ symbol: "FCS", amount: fcs });
	if (fps > 0n) rows.push({ symbol: "FPS", amount: fps });

	return (
		<PortfolioDrawerSection title="Wallet" count={rows.length}>
			{rows.length === 0 ? (
				<div className="text-xs text-text-secondary py-1">No ZCHF or FCS in wallet.</div>
			) : (
				rows.map((r) => <Item key={r.symbol} symbol={r.symbol} amount={r.amount} migrate={r.symbol === "FPS"} />)
			)}
		</PortfolioDrawerSection>
	);
}
