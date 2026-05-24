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
	const isInvest = item.kind === "Invested";
	const price = (item.amount * 10n ** 18n) / item.shares;

	return (
		<TableRow headers={headers} tab={tab} rawHeader={true}>
			<div className="flex flex-col md:text-left max-md:text-right">
				<span className="text-[15px] text-text-primary">
					<AppLink className="" label={dateStr} href={TxUrl(item.txHash as Hash, SupportedChains.mainnet)} external={true} />
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">
						{isInvest ? "-" : ""}
						{formatCurrency(formatUnits(item.amount, 18))}
					</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(item.shares, 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">FPS</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(price, 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>
		</TableRow>
	);
}
