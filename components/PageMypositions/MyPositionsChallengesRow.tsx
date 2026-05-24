import { Address, formatUnits, parseEther, zeroAddress } from "viem";
import TableRow from "../Table/TableRowSearchable";
import { BidsQueryType, ChallengesId, ChallengesQueryItem } from "@frankencoin/api";
import { RootState } from "../../redux/redux.store";
import { useSelector } from "react-redux";
import TokenLogo from "@components/TokenLogo";
import { formatCurrency, normalizeAddress } from "../../utils/format";
import { useContractUrl } from "@hooks";
import MyPositionsChallengesCancel from "./MyPositionsChallengesCancel";
import AppButtonSecondary from "@components/AppButtonSecondary";
import AppBox from "@components/AppBox";
import { TxUrl } from "@utils";

interface Props {
	headers: string[];
	tab: string;
	challenge: ChallengesQueryItem;
}

export default function MyPositionsChallengesRow({ headers, tab, challenge }: Props) {
	const positions = useSelector((state: RootState) => state.positions.mapping);
	const prices = useSelector((state: RootState) => state.prices.coingecko);
	const bids = useSelector((state: RootState) => state.bids.challenges.map[challenge.id] || []);

	const position = positions.map[normalizeAddress(challenge.position)];
	const url = useContractUrl(position.collateral || zeroAddress);
	if (!position) return null;

	const collTokenPrice = prices[normalizeAddress(position.collateral)]?.price?.usd;
	const zchfPrice = prices[normalizeAddress(position.zchf)]?.price?.usd;
	if (!collTokenPrice || !zchfPrice) return null;

	const start: number = parseInt(challenge.start.toString()) * 1000; // timestap
	const duration: number = parseInt(challenge.duration.toString()) * 1000;

	const timeToExpiration = start >= position.expiration * 1000 ? 0 : position.expiration * 1000 - start;
	const phase1 = Math.min(timeToExpiration, duration);

	const declineStartTimestamp = start + phase1;
	const zeroPriceTimestamp = start + phase1 + duration;

	let stateIdx: number = 0;

	if (zeroPriceTimestamp < Date.now()) {
		stateIdx = 1;
	} else if (declineStartTimestamp > Date.now()) {
		stateIdx = 0;
	} else {
		stateIdx = 1;
	}

	const challengeSize: number = parseInt(challenge.size.toString()) / 10 ** position.collateralDecimals;

	const avertedSize: number =
		(parseInt(challenge.filledSize.toString()) - parseInt(challenge.acquiredCollateral.toString())) / 10 ** position.collateralDecimals;

	const avertedRatio: number = avertedSize / challengeSize;

	const succeededSize: number = parseInt(challenge.acquiredCollateral.toString()) / 10 ** position.collateralDecimals;

	const succeededRatio: number = succeededSize / challengeSize;

	const allProceeds = bids.reduce((a, b) => (b.bidType == BidsQueryType.Averted ? a + parseFloat(formatUnits(b.bid, 18)) : a), 0);
	const allRewards = bids.reduce((a, b) => (b.bidType == BidsQueryType.Succeeded ? a + parseFloat(formatUnits(b.bid, 18)) * 0.02 : a), 0);

	const openExplorer = (e: any) => {
		e.preventDefault();
		window.open(url, "_blank");
	};

	return (
		<TableRow
			headers={headers}
			tab={tab}
			actionCol={
				stateIdx == 1 ? (
					<button
						type="button"
						onClick={() => window.open(TxUrl(challenge.txHash), "_blank")}
						className="group inline-flex items-center gap-1.5 px-1 py-2 text-[13px] font-semibold text-text-active cursor-pointer transition-[gap] duration-150 ease-out hover:gap-2.5"
					>
						View
						<span className="transition-transform duration-150 ease-out group-hover:translate-x-1" aria-hidden>
							→
						</span>
					</button>
				) : (
					<MyPositionsChallengesCancel challenge={challenge} hidden={stateIdx == 1} />
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
						<span className="font-mono">{formatCurrency(challengeSize, 2, 2)}</span>
						<span className="ml-1 font-mono text-[11px] text-text-secondary">{position.collateralSymbol}</span>
					</span>
				</div>

				<AppBox className="md:hidden flex flex-row items-center">
					<div className="mr-4 cursor-pointer" onClick={openExplorer}>
						<TokenLogo currency={position.collateralSymbol} />
					</div>
					<div className="text-[15px] text-text-primary">
						<span className="font-mono">{formatCurrency(challengeSize)}</span>
						<span className="ml-1 font-mono text-[11px] text-text-secondary">{position.collateralSymbol}</span>
					</div>
				</AppBox>
			</div>

			{/* Averted Ratio */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(avertedRatio * 100, 2, 2)}</span>
					<span className="ml-0.5 font-mono text-[11px] text-text-secondary">%</span>
				</span>
			</div>

			{/* All Proceeds */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(allProceeds, 2, 2)}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>

			{/* Succeeded Ratio */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(succeededRatio * 100, 2, 2)}</span>
					<span className="ml-0.5 font-mono text-[11px] text-text-secondary">%</span>
				</span>
			</div>

			{/* All Rewards */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(allRewards, 2, 2)}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
			</div>
		</TableRow>
	);
}
