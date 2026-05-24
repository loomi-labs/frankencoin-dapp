import TableHeader from "../Table/TableHeadSearchable";
import TableBody from "../Table/TableBody";
import Table from "../Table";
import TableRowEmpty from "../Table/TableRowEmpty";
import TablePagination from "../Table/TablePagination";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/redux.store";
import { useState } from "react";
import { SavingsActivityQuery } from "@frankencoin/api";
import SavingsRecentActivitiesRow from "./SavingsRecentActivitiesRow";
import { useChainId } from "wagmi";
import { ADDRESS, ChainId } from "@frankencoin/zchf";
import { normalizeAddress } from "../../utils/format";
import { mainnet } from "viem/chains";
import { useLocalStorage } from "@hooks";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const PAGE_SIZE_STORAGE_KEY = "frankencoin.pageSize";

export default function SavingsRecentActivitiesTable() {
	const headers: string[] = ["Date", "Kind", "Amount", "Balance"];
	const [tab, setTab] = useState<string>(headers[0]);
	const [reverse, setReverse] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [storedPageSize, setStoredPageSize] = useLocalStorage(PAGE_SIZE_STORAGE_KEY);
	const pageSize = PAGE_SIZE_OPTIONS.includes(storedPageSize as number) ? (storedPageSize as number) : PAGE_SIZE_OPTIONS[0];
	const chainId = useChainId() as ChainId;

	const activities = useSelector((state: RootState) => state.savings.savingsActivity);
	const ignoreModule = normalizeAddress(ADDRESS[mainnet.id].savingsV2);
	const matching = activities.filter((l) => l.chainId == chainId && normalizeAddress(l.module) !== ignoreModule);

	const sorted: SavingsActivityQuery[] = sortFunction({ list: matching, headers, tab, reverse });
	const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
	const pageSafe = Math.min(page, totalPages - 1);
	const paginated = sorted.slice(pageSafe * pageSize, (pageSafe + 1) * pageSize);

	const handleTabOnChange = function (e: string) {
		if (tab === e) {
			setReverse(!reverse);
		} else {
			setReverse(false);
			setTab(e);
		}
		setPage(0);
	};

	return (
		<Table>
			<TableHeader headers={headers} tab={tab} reverse={reverse} tabOnChange={handleTabOnChange} />
			<TableBody>
				{paginated.length == 0 ? (
					<TableRowEmpty>{"There are no activities yet."}</TableRowEmpty>
				) : (
					paginated.map((r, idx) => (
						<SavingsRecentActivitiesRow
							headers={headers}
							tab={tab}
							key={`${r.chainId}-${r.account}-${r.module}-${r.count}-${r.kind}` || `SavingsRecentActivitiesRow_${idx}`}
							item={r}
						/>
					))
				)}
			</TableBody>
			<TablePagination
				currentPage={pageSafe}
				totalPages={totalPages}
				totalItems={sorted.length}
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
	list: SavingsActivityQuery[];
	headers: string[];
	tab: string;
	reverse: boolean;
};

function sortFunction(params: SortFunctionParams): SavingsActivityQuery[] {
	const { list, headers, tab, reverse } = params;
	let sortingList = [...list]; // make it writeable

	if (tab === headers[0]) {
		// Date
		sortingList.sort((a, b) => b.created - a.created);
	} else if (tab === headers[1]) {
		// Kind
		sortingList.sort((a, b) => a.kind.localeCompare(b.kind));
	} else if (tab === headers[2]) {
		// Amount
		sortingList.sort((a, b) => parseInt(b.amount) - parseInt(a.amount));
	} else if (tab === headers[3]) {
		// Balance
		sortingList.sort((a, b) => parseInt(b.balance) - parseInt(a.balance));
	}

	return reverse ? sortingList.reverse() : sortingList;
}
