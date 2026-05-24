import BorrowRow from "./BorrowRow";
import TableHeadSearchable, { FilterOption } from "../Table/TableHeadSearchable";
import TableBody from "../Table/TableBody";
import Table from "../Table";
import TableRowEmpty from "../Table/TableRowEmpty";
import TablePagination from "../Table/TablePagination";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/redux.store";
import { PositionQueryV2, PriceQueryObjectArray } from "@frankencoin/api";
import { Address, erc20Abi, formatUnits, zeroAddress } from "viem";
import { useEffect, useMemo, useState } from "react";
import { useConnection, useReadContracts } from "wagmi";
import { ALL_CATEGORIES, CollateralCategory, collateralMatchesCategories, formatCurrency, getCategoriesForCollateral, normalizeAddress } from "@utils";
import { useBorrowPositions, useLocalStorage, useSwapCHFAUStats, SwapVCHFStatsReturn } from "@hooks";

const PAGE_SIZE_STORAGE_KEY = "frankencoin.pageSize";

const STABLECOIN_CATEGORY: CollateralCategory = "Stablecoins";
const FILTER_OPTIONS: FilterOption[] = ALL_CATEGORIES.filter((c) => c !== STABLECOIN_CATEGORY).map((c) => ({
	label: c,
	value: c,
}));
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function BorrowTable() {
	const headers: string[] = ["Collateral", "Loan-to-Value", "Interest", "Maturity"];
	const [tab, setTab] = useState<string>(headers[0]);
	const [reverse, setReverse] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [activeCategories, setActiveCategories] = useState<string[]>([]);
	const [inMyWallet, setInMyWallet] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [storedPageSize, setStoredPageSize] = useLocalStorage(PAGE_SIZE_STORAGE_KEY);
	const pageSize = PAGE_SIZE_OPTIONS.includes(storedPageSize as number) ? (storedPageSize as number) : PAGE_SIZE_OPTIONS[0];

	const { address: walletAddress } = useConnection();
	const chfauBridge = useSwapCHFAUStats();
	const { uniqueByCollateral } = useBorrowPositions();

	const { coingecko } = useSelector((state: RootState) => state.prices);

	const uniquePositions: PositionQueryV2[] = Object.values(uniqueByCollateral);

	const bridgeMap: Record<string, SwapVCHFStatsReturn> = {
		[normalizeAddress(chfauBridge.bridgeAddress)]: chfauBridge,
	};

	const sortedAll: PositionQueryV2[] = sortPositions(
		[...uniquePositions, chfauBridge.asBorrowPosition],
		coingecko,
		headers,
		tab,
		reverse
	);

	const sorted: PositionQueryV2[] = sortedAll.filter(
		(pos) => !getCategoriesForCollateral(pos.collateral).includes(STABLECOIN_CATEGORY)
	);

	// Wallet balance detection for "In my wallet" toggle
	const uniqueCollaterals = useMemo(
		() => [...new Set(sorted.map((p) => normalizeAddress(p.collateral)))],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sorted.map((p) => p.collateral).join(",")]
	);

	const { data: balanceResults } = useReadContracts({
		contracts: uniqueCollaterals.map((addr) => ({
			address: addr,
			abi: erc20Abi,
			functionName: "balanceOf" as const,
			args: [walletAddress ?? zeroAddress],
		})),
		query: { enabled: !!walletAddress && inMyWallet },
	});

	const walletBalanceMap = useMemo(() => {
		const map: Record<string, bigint> = {};
		uniqueCollaterals.forEach((addr, i) => {
			map[addr] = (balanceResults?.[i]?.result as bigint | undefined) ?? 0n;
		});
		return map;
	}, [uniqueCollaterals, balanceResults]);

	const filteredList = useMemo(() => {
		return sorted.filter((pos) => {
			const addr = normalizeAddress(pos.collateral);
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				if (!pos.collateralName.toLowerCase().includes(q) && !pos.collateralSymbol.toLowerCase().includes(q)) return false;
			}
			if (activeCategories.length > 0 && !collateralMatchesCategories(addr, activeCategories as CollateralCategory[])) return false;
			if (inMyWallet && walletAddress && (walletBalanceMap[addr] ?? 0n) === 0n) return false;
			return true;
		});
	}, [sorted, searchQuery, activeCategories, inMyWallet, walletAddress, walletBalanceMap]);

	const effectiveInterest = (p: PositionQueryV2) =>
		(p.annualInterestPPM / 1e6) / (1 - p.reserveContribution / 1e6) * 100;
	const interests = sorted.map(effectiveInterest).filter((n) => isFinite(n) && n > 0);
	const minI = interests.length ? Math.min(...interests) : 0;
	const maxI = interests.length ? Math.max(...interests) : 0;
	const sameI = minI === maxI;
	const hasStats = sorted.length > 0 && interests.length > 0;

	const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
	const pageSafe = Math.min(page, totalPages - 1);
	const paginatedList = filteredList.slice(pageSafe * pageSize, (pageSafe + 1) * pageSize);

	useEffect(() => {
		setPage(0);
	}, [tab, reverse, searchQuery, activeCategories, inMyWallet]);

	const handleTabOnChange = function (e: string) {
		if (tab === e) {
			setReverse(!reverse);
		} else {
			setReverse(false);
			setTab(e);
		}
	};

	return (
		<Table borderless>
			<div className="grid grid-cols-2 border-b border-card-input-border">
				<div className="px-8 xl:px-10 py-4 border-r border-card-input-border">
					<div className="text-[11px] uppercase tracking-[0.12em] text-text-header mb-1">Collaterals</div>
					<div className="font-display font-semibold text-2xl tracking-tight text-text-primary">
						{hasStats ? sorted.length : "—"}
					</div>
				</div>
				<div className="px-8 xl:px-10 py-4">
					<div className="text-[11px] uppercase tracking-[0.12em] text-text-header mb-1">Interest range</div>
					<div className="font-display font-semibold text-2xl tracking-tight text-text-primary">
						{hasStats ? (
							<>
								{sameI ? (
									<>{formatCurrency(minI, 2, 2)}%</>
								) : (
									<>
										{formatCurrency(minI, 2, 2)}
										<span className="text-text-secondary mx-1.5">–</span>
										{formatCurrency(maxI, 2, 2)}%
									</>
								)}
								<span className="text-sm font-mono text-text-secondary ml-1.5">p.a.</span>
							</>
						) : (
							"—"
						)}
					</div>
				</div>
			</div>
			<TableHeadSearchable
				headers={headers}
				tab={tab}
				reverse={reverse}
				tabOnChange={handleTabOnChange}
				actionCol
				searchPlaceholder="Search Positions"
				searchValue={searchQuery}
				onSearchChange={setSearchQuery}
				hideMyWallet={!walletAddress}
				inMyWallet={inMyWallet}
				onInMyWalletChange={setInMyWallet}
				filterOptions={FILTER_OPTIONS}
				activeFilters={activeCategories}
				onFiltersChange={setActiveCategories}
			/>
			<TableBody>
				{paginatedList.length == 0 ? (
					<TableRowEmpty>
						{!walletAddress ? "There are no other positions yet." : "You don't have any available collaterals in your wallet."}
					</TableRowEmpty>
				) : (
					paginatedList.map((pos, idx) => (
						<BorrowRow
							headers={headers}
							tab={tab}
							position={pos}
							bridgeStats={bridgeMap[normalizeAddress(pos.position)]}
							hideMyWallet={!walletAddress}
							walletBalance={walletBalanceMap}
							key={`BorrowRow_${pos.position || idx}`}
						/>
					))
				)}
			</TableBody>
			<TablePagination
				currentPage={pageSafe}
				totalPages={totalPages}
				totalItems={filteredList.length}
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

function sortPositions(
	list: PositionQueryV2[],
	prices: PriceQueryObjectArray,
	headers: string[],
	tab: string,
	reverse: boolean
): PositionQueryV2[] {
	const sorting = [...list];

	if (tab === headers[0]) {
		// sort for Collateral
		sorting.sort((a, b) => a.collateralSymbol.localeCompare(b.collateralSymbol)); // default: increase
	} else if (tab === headers[1]) {
		// sort for LTV, nominal LTV = liquidation price / market price
		sorting.sort((a, b) => {
			const calc = function (p: PositionQueryV2) {
				const liqPrice: number = parseFloat(formatUnits(BigInt(p.price), 36 - p.collateralDecimals));
				const price: number = prices[normalizeAddress(p.collateral)]?.price?.chf || 1;
				return liqPrice / price;
			};
			return calc(b) - calc(a); // default: decrease
		});
	} else if (tab === headers[2]) {
		// sort for Interest, effI = interest / (1 - reserve)
		sorting.sort((a, b) => {
			const calc = function (p: PositionQueryV2) {
				const r: number = p.reserveContribution / 1000000;
				const i: number = p.annualInterestPPM / 1000000;
				return (i / (1 - r)) * 1000000;
			};
			return calc(b) - calc(a);
		});
	} else if (tab === headers[3]) {
		// sort for maturity
		sorting.sort((a, b) => b.expiration - a.expiration); // default: decrease
	}

	return reverse ? sorting.reverse() : sorting;
}
