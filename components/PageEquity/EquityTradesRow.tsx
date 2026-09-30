import AppLink from "@components/AppLink";
import TableRow from "@components/Table/TableRowSearchable";
import { SupportedChains } from "@frankencoin/zchf";
import { EquityTrade } from "@hooks";
import { TxUrl, formatCurrency } from "@utils";
import { formatUnits, Hash } from "viem";

interface Props {
	headers: string[];
	tab: string;
	item: EquityTrade;
}

export default function EquityTradesRow({ headers, tab, item }: Props) {
	const dateArr = new Date(item.created * 1000).toDateString().split(" ");
	const dateStr = `${dateArr[2]} ${dateArr[1]} ${dateArr[3]}`;
	const isInvest = item.kind === "Invested" || item.kind === "FCS Deposit";
	// Wrap/Unwrap are a strict 1:1 FPS<->FCS swap with no ZCHF leg — no amount or price to show.
	const isWrap = item.kind === "FCS Wrap" || item.kind === "FCS Unwrap";
	const sharesLabel = item.kind === "FCS Deposit" || item.kind === "FCS Withdraw" || item.kind === "FCS Wrap" ? "FCS" : "FPS";

	return (
		<TableRow headers={headers} tab={tab} rawHeader={true}>
			<div className="flex flex-col md:text-left max-md:text-right">
				<span className="text-[15px] text-text-primary">
					<AppLink className="" label={dateStr} href={TxUrl(item.txHash as Hash, SupportedChains.mainnet)} external={true} />
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					{isWrap ? (
						<span className="font-mono">—</span>
					) : (
						<>
							<span className="font-mono">
								{isInvest ? "-" : ""}
								{formatCurrency(formatUnits(item.amount, 18))}
							</span>
							<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
						</>
					)}
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(item.shares, 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">{sharesLabel}</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					{isWrap || item.shares === 0n ? (
						<span className="font-mono">1:1</span>
					) : (
						<>
							<span className="font-mono">{formatCurrency(formatUnits((item.amount * 10n ** 18n) / item.shares, 18))}</span>
							<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
						</>
					)}
				</span>
			</div>
		</TableRow>
	);
}
