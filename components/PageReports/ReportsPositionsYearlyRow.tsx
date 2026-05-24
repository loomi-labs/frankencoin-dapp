import TableRow from "@components/Table/TableRowSearchable";
import { formatCurrency } from "@utils";
import { formatUnits } from "viem";
import { AccountYearly } from "./ReportsPositionsYearlyTable";

interface Props {
	headers: string[];
	tab: string;
	item: AccountYearly;
}

export default function ReportsPositionsYearlyRow({ headers, tab, item }: Props) {
	const current = new Date().getFullYear();
	return (
		<TableRow headers={headers} tab={tab} rawHeader={true}>
			<div className="flex flex-col md:text-left">
				<span className="text-[15px] text-text-primary">{item.year == current ? "Current" : item.year}</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(BigInt(item.interestPaid), 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(BigInt(item.openDebt), 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(BigInt(item.valueLocked), 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>
		</TableRow>
	);
}
