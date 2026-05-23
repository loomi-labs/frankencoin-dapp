import TableRowSearchable from "../Table/TableRowSearchable";
import { RootState } from "../../redux/redux.store";
import { useSelector } from "react-redux";
import { useRouter as useNavigation } from "next/navigation";
import { formatCurrency, normalizeAddress } from "../../utils/format";
import { PositionQueryV2 } from "@frankencoin/api";
import DisplayCollateralBorrowTable from "./DisplayCollateralBorrowTable";
import AppBox from "@components/AppBox";
import { formatUnits } from "viem";
import { SwapVCHFStatsReturn } from "@hooks";
import dayjs from "dayjs";

interface Props {
	headers: string[];
	tab: string;
	position: PositionQueryV2;
	bridgeStats?: SwapVCHFStatsReturn;
	hideMyWallet?: boolean;
	walletBalance?: Record<string, bigint>;
}

export default function BorrowRow({ headers, tab, position, bridgeStats, hideMyWallet, walletBalance }: Props) {
	const navigate = useNavigation();

	const prices = useSelector((state: RootState) => state.prices.coingecko);
	const collTokenPrice = prices[normalizeAddress(position.collateral)]?.price?.usd || 0;
	const zchfPrice = prices[normalizeAddress(position.zchf)]?.price?.usd || 0;

	const isBridge = !!bridgeStats;
	if (!isBridge && (!collTokenPrice || !zchfPrice)) return null;

	const interest: number = position.annualInterestPPM / 10 ** 4;
	const reserve: number = position.reserveContribution / 10 ** 4;
	const price: number = parseInt(position.price) / 10 ** (36 - position.collateralDecimals);

	const nominalLTV: number = (price / collTokenPrice) * zchfPrice * 100;
	const effectiveInterest: number = interest / (1 - reserve / 100);

	const isPending = position.start * 1000 > Date.now();
	const isBridgeExpired = isBridge && position.expiration * 1000 < Date.now();
	const isPerpetual = isBridge && !isBridgeExpired;

	const expirationDayjs = dayjs(position.expiration * 1000);
	const expirationRelative = expirationDayjs.fromNow();
	const expirationAbsolute = expirationDayjs.format("DD MMM YYYY");

	const collateralBalance = parseFloat(
		formatUnits(walletBalance?.[normalizeAddress(position.collateral)] ?? 0n, position.collateralDecimals)
	);

	const ltvBarWidth = Math.max(0, Math.min(100, nominalLTV));
	const ltvBarColor =
		nominalLTV >= 90 ? "bg-text-warning" : nominalLTV >= 80 ? "bg-amber-500" : "bg-text-secondary";
	const ctaLabel = isBridge ? (isBridgeExpired ? "Redeem" : "Swap") : "Mint";

	const handleAction = () => navigate.push(isBridge ? bridgeStats!.swapUrl : `/mint/${position.position}`);

	return (
		<TableRowSearchable
			headers={headers}
			tab={tab}
			actionCol={
				<button
					type="button"
					onClick={handleAction}
					disabled={isPending}
					className={`group inline-flex items-center gap-1.5 px-1 py-2 text-[13px] font-semibold transition-[gap] duration-150 ease-out ${
						isPending
							? "text-text-secondary cursor-not-allowed"
							: "text-text-active cursor-pointer hover:gap-2.5"
					}`}
				>
					{isPending ? "Soon" : ctaLabel}
					{!isPending && (
						<span className="transition-transform duration-150 ease-out group-hover:translate-x-1" aria-hidden>
							→
						</span>
					)}
				</button>
			}
		>
			<div className="flex flex-col max-md:mb-5">
				<AppBox className="md:hidden">
					<DisplayCollateralBorrowTable
						symbol={position.collateralSymbol}
						name={position.collateralName}
						address={position.collateral}
						price={collTokenPrice}
						hideMyWallet={hideMyWallet}
						balance={collateralBalance}
					/>
				</AppBox>
				<div className="max-md:hidden">
					<DisplayCollateralBorrowTable
						symbol={position.collateralSymbol}
						name={position.collateralName}
						address={position.collateral}
						price={collTokenPrice}
						hideMyWallet={hideMyWallet}
						balance={collateralBalance}
					/>
				</div>
			</div>

			<div className="flex flex-col items-end gap-2">
				{isBridge ? (
					<span className="font-mono text-[15px] text-text-primary">{isBridgeExpired ? "Redeem 1:1" : "Swap 1:1"}</span>
				) : (
					<>
						<span className="text-[15px] text-text-primary">
							<span className="font-mono">{formatCurrency(nominalLTV, 2, 2)}</span>
							<span className="ml-0.5 font-mono text-[11px] text-text-secondary">%</span>
						</span>
						<span className="block h-[2px] w-[72px] overflow-hidden rounded-[1px] bg-card-input-border">
							<span
								className={`block h-full ${ltvBarColor}`}
								style={{ width: `${ltvBarWidth}%` }}
							/>
						</span>
					</>
				)}
			</div>

			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(effectiveInterest, 2, 2)}</span>
					<span className="ml-0.5 font-mono text-[11px] text-text-secondary">%</span>
				</span>
			</div>

			<div className="flex flex-col items-end">
				{isPending ? (
					<span className="text-[14px] font-medium text-text-active">Available Soon</span>
				) : isPerpetual ? (
					<span className="text-text-secondary">—</span>
				) : (
					<>
						<span className="text-[14px] font-medium text-text-primary capitalize">{expirationRelative}</span>
						<span className="mt-0.5 font-mono text-[11px] tracking-[0.02em] text-text-secondary">{expirationAbsolute}</span>
					</>
				)}
			</div>
		</TableRowSearchable>
	);
}
