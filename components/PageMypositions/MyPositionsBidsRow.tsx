import { Address, formatUnits, zeroAddress } from "viem";
import TableRow from "../Table/TableRowSearchable";
import { BidsQueryItem, ChallengesId } from "@frankencoin/api";
import { RootState } from "../../redux/redux.store";
import { useSelector } from "react-redux";
import TokenLogo from "@components/TokenLogo";
import { formatCurrency, normalizeAddress } from "../../utils/format";
import { useContractUrl } from "@hooks";
import { useRouter as useNavigation } from "next/navigation";
import { useConnection } from "wagmi";
import AppBox from "@components/AppBox";
import { TxUrl } from "@utils";

interface Props {
	headers: string[];
	tab: string;
	bid: BidsQueryItem;
}

export default function MyPositionsBidsRow({ headers, tab, bid }: Props) {
	const positions = useSelector((state: RootState) => state.positions.mapping);
	const challenges = useSelector((state: RootState) => state.challenges.mapping);

	const pid = normalizeAddress(bid.position);
	const cid = `${pid}-challenge-${bid.number}` as ChallengesId;

	const position = positions.map[pid];
	const challenge = challenges.map[cid];
	const url = useContractUrl(position.collateral || zeroAddress);
	const urlBid = TxUrl(bid.txHash);
	const account = useConnection();
	const navigate = useNavigation();
	if (!position || !challenge) return null;

	const openExplorer = (e: any) => {
		e.preventDefault();
		window.open(url, "_blank");
	};

	const openExplorerBid = (e: any) => {
		e.preventDefault();
		window.open(urlBid, "_blank");
	};

	const isDisabled: boolean = challenge.status !== "Active" || account.address !== bid.bidder;

	return (
		<TableRow
			headers={headers}
			tab={tab}
			actionCol={
				isDisabled ? (
					<button
						type="button"
						onClick={openExplorerBid}
						className="group inline-flex items-center gap-1.5 px-1 py-2 text-[13px] font-semibold text-text-active cursor-pointer transition-[gap] duration-150 ease-out hover:gap-2.5"
					>
						View
						<span className="transition-transform duration-150 ease-out group-hover:translate-x-1" aria-hidden>
							→
						</span>
					</button>
				) : (
					<button
						type="button"
						onClick={() => navigate.push(`/monitoring/${normalizeAddress(challenge.position)}/auction/${challenge.number}`)}
						className="group inline-flex items-center gap-1.5 px-1 py-2 text-[13px] font-semibold text-text-active cursor-pointer transition-[gap] duration-150 ease-out hover:gap-2.5"
					>
						Buy again
						<span className="transition-transform duration-150 ease-out group-hover:translate-x-1" aria-hidden>
							→
						</span>
					</button>
				)
			}
		>
			{/* Collateral */}
			<div className="flex flex-col max-md:mb-5">
				<div className="max-md:hidden flex flex-row items-center -ml-12">
					<span className="mr-4 cursor-pointer" onClick={openExplorer}>
						<TokenLogo currency={position.collateralSymbol} />
					</span>
					<span className="text-[15px] text-text-primary">
						<span className="font-mono">{formatCurrency(formatUnits(bid.filledSize, position.collateralDecimals))}</span>
						<span className="ml-1 font-mono text-[11px] text-text-secondary">{position.collateralSymbol}</span>
					</span>
				</div>

				<AppBox className="md:hidden flex flex-row items-center">
					<div className="mr-4 cursor-pointer" onClick={openExplorer}>
						<TokenLogo currency={position.collateralSymbol} />
					</div>
					<div className="text-[15px] text-text-primary">
						<span className="font-mono">{formatCurrency(formatUnits(bid.filledSize, position.collateralDecimals))}</span>
						<span className="ml-1 font-mono text-[11px] text-text-secondary">{position.collateralSymbol}</span>
					</div>
				</AppBox>
			</div>

			{/* Price */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(bid.price, 36 - position.collateralDecimals), 2, 2)}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>

			{/* Bid */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(formatUnits(bid.bid, 18), 2, 2)}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>

			{/* State */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">{bid.bidType}</span>
			</div>
		</TableRow>
	);
}
