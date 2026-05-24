import Table from "@components/Table";
import TableBody from "@components/Table/TableBody";
import TableHeader from "@components/Table/TableHead";
import TablePagination from "@components/Table/TablePagination";
import TableRowEmpty from "@components/Table/TableRowEmpty";
import { EquityTrade, useLocalStorage } from "@hooks";
import { useEffect, useState } from "react";
import EquityTradesRow from "./EquityTradesRow";

const PAGE_SIZE_STORAGE_KEY = "frankencoin.pageSize";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface Props {
	trades: EquityTrade[];
}

export default function EquityTradesTable({ trades }: Props) {
	const headers: string[] = ["Date", "Amount", "Shares", "Price"];
	const [tab, setTab] = useState<string>(headers[0]);
	const [reverse, setReverse] = useState<boolean>(false);
	const [list, setList] = useState<EquityTrade[]>([]);
	const [page, setPage] = useState<number>(0);
	const [storedPageSize, setStoredPageSize] = useLocalStorage(PAGE_SIZE_STORAGE_KEY);
	const pageSize = PAGE_SIZE_OPTIONS.includes(storedPageSize as number) ? (storedPageSize as number) : PAGE_SIZE_OPTIONS[0];

	const sorted = sortFunction({ list: trades, headers, tab, reverse });

	useEffect(() => {
		const idList = list.map((l) => l.txHash).join("_");
		const idSorted = sorted.map((l) => l.txHash).join("_");
		if (idList !== idSorted) setList(sorted);
	}, [list, sorted]);

	useEffect(() => {
		setPage(0);
	}, [tab, reverse]);

	const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
	const pageSafe = Math.min(page, totalPages - 1);
	const paginatedList = list.slice(pageSafe * pageSize, (pageSafe + 1) * pageSize);

	const handleTabOnChange = (e: string) => {
		if (tab === e) {
			setReverse(!reverse);
		} else {
			setReverse(false);
			setTab(e);
		}
	};

	return (
		<Table borderless>
			<TableHeader headers={headers} tab={tab} reverse={reverse} tabOnChange={handleTabOnChange} />
			<TableBody>
				{paginatedList.length === 0 ? (
					<TableRowEmpty>{"No trades yet."}</TableRowEmpty>
				) : (
					paginatedList.map((r, idx) => (
						<EquityTradesRow headers={headers} tab={tab} key={`EquityTradesRow_${idx}_${r.txHash}`} item={r} />
					))
				)}
			</TableBody>
			<TablePagination
				currentPage={pageSafe}
				totalPages={totalPages}
				totalItems={list.length}
				pageSize={pageSize}
				pageSizeOptions={PAGE_SIZE_OPTIONS}
				onPageChange={setPage}
				onPageSizeChange={(size) => {
					setStoredPageSize(size);
					setPage(0);
				}}
			/>
		</Table>
	);
}

type SortFunctionParams = {
	list: EquityTrade[];
	headers: string[];
	tab: string;
	reverse: boolean;
};

function sortFunction({ list, headers, tab, reverse }: SortFunctionParams): EquityTrade[] {
	const sortingList = [...list];

	if (tab === headers[0]) {
		// Date
		sortingList.sort((a, b) => b.created - a.created);
	} else if (tab === headers[1]) {
		// Amount
		sortingList.sort((a, b) => (b.amount > a.amount ? 1 : -1));
	} else if (tab === headers[2]) {
		// Shares
		sortingList.sort((a, b) => (b.shares > a.shares ? 1 : -1));
	} else if (tab === headers[3]) {
		// Price
		sortingList.sort((a, b) => (b.price > a.price ? 1 : -1));
	}

	return reverse ? sortingList.reverse() : sortingList;
}
