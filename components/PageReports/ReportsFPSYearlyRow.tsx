import TableRow from "@components/Table/TableRowSearchable";
import { Address, formatUnits } from "viem";
import { AccountYearly } from "./ReportsFPSYearlyTable";
import { formatCurrency } from "@utils";

interface Props {
	headers: string[];
	tab: string;
	address: Address;
	item: AccountYearly;
}

export default function ReportsFPSYearlyRow({ headers, tab, address, item }: Props) {
	const current = new Date().getFullYear();
	return (
		<TableRow headers={headers} tab={tab} rawHeader={true}>
			<div className="flex flex-col md:text-left">
				<span className="text-[15px] text-text-primary">{item.year == current ? "Current" : item.year}</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(item.earnings, 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(item.balance, 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">FPS</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(item.value, 18))}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>
		</TableRow>
	);
}
