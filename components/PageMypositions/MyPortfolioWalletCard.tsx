import dynamic from "next/dynamic";
import { Address, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { Icon } from "@iconify/react";
import { useConnection } from "wagmi";
import { useUserBalance } from "@hooks";
import { formatCurrency } from "../../utils/format";
import AppLink from "@components/AppLink";
import AppCard from "@components/AppCard";
import AppButtonSecondary from "@components/AppButtonSecondary";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

function Row({ symbol, amount, migrate }: { symbol: string; amount: bigint; migrate?: boolean }) {
	return (
		<div className="flex items-center gap-2 rounded-lg bg-card-content-primary px-3 py-2">
			<TokenLogo currency={symbol} size={6} />
			<div className="flex-1 text-sm font-medium text-text-primary">{symbol}</div>
			<div className="text-sm font-mono text-text-primary">{formatCurrency(formatUnits(amount, 18))}</div>
			{migrate && <AppLink label="Migrate" href="/equity?from=FPS&to=FCS" icon className="flex items-center text-sm" />}
		</div>
	);
}

export default function MyPortfolioWalletCard({ account }: { account: Address }) {
	const { address } = useConnection();
	const balances = useUserBalance(account);
	const isOwnAccount = address?.toLowerCase() === account.toLowerCase();
	const zchf = balances[mainnet.id]?.frankencoin ?? 0n;
	const fcs = balances[mainnet.id]?.fcs ?? 0n;
	const fps = balances[mainnet.id]?.equity ?? 0n;

	const rows = [
		{ symbol: "ZCHF", amount: zchf },
		{ symbol: "FCS", amount: fcs },
		{ symbol: "FPS", amount: fps },
	].filter((r) => r.amount > 0n);

	return (
		<AppCard>
			<div className="flex items-center gap-3">
				<div className="w-8 h-8 flex items-center justify-center rounded-full bg-card-content-primary text-text-primary">
					<Icon icon="solar:wallet-linear" className="w-5 h-5" />
				</div>
				<div className="flex-1">
					<div className="text-sm text-text-secondary">Wallet</div>
					<div className="text-lg font-display font-semibold text-text-primary">Balances</div>
				</div>
			</div>

			{rows.length === 0 ? (
				<div className="text-sm text-text-secondary">No ZCHF or FCS in wallet.</div>
			) : (
				rows.map((r) => <Row key={r.symbol} symbol={r.symbol} amount={r.amount} migrate={r.symbol === "FPS" && isOwnAccount} />)
			)}

			<AppButtonSecondary to="/transfer" size="medium" className="mt-auto">
				Transfer
			</AppButtonSecondary>
		</AppCard>
	);
}
