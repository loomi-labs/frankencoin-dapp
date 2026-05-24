import { Address, formatUnits } from "viem";
import TableRow from "../Table/TableRowSearchable";
import { PositionQuery, ChallengesQueryItem } from "@frankencoin/api";
import { RootState } from "../../redux/redux.store";
import { useSelector } from "react-redux";
import { formatCurrency, normalizeAddress } from "../../utils/format";
import MyPositionsDisplayCollateral from "./MyPositionsDisplayCollateral";
import { useRouter as useNavigate } from "next/navigation";
import AppBox from "@components/AppBox";

interface Props {
	headers: string[];
	tab: string;
	position: PositionQuery;
}

type ChallengeInfos = {
	start: number;
	duration: number;
	maturity: number;
	time2exp: number;
	isQuick: boolean;
	decline: number;
	challenge: ChallengesQueryItem;
};

export default function MypositionsRow({ headers, tab, position }: Props) {
	const navigate = useNavigate();

	const prices = useSelector((state: RootState) => state.prices.coingecko);
	const challenges = useSelector((state: RootState) => state.challenges.positions);
	const collTokenPrice = prices[normalizeAddress(position.collateral)]?.price?.usd;
	const zchfPrice = prices[normalizeAddress(position.zchf)]?.price?.usd;
	if (!collTokenPrice || !zchfPrice) return null;

	const maturity: number = (position.expiration * 1000 - Date.now()) / 1000 / 60 / 60 / 24;

	const balance: number = parseInt(position.collateralBalance) / 10 ** position.collateralDecimals;
	const balanceZCHF: number = (balance * collTokenPrice) / zchfPrice;

	const loanZCHF: number = parseInt(position.minted) / 10 ** position.zchfDecimals;
	const loanAvailableV1: number = parseFloat(formatUnits(position.version == 1 ? BigInt(position.availableForClones) : 0n, 18));
	const loanAvailableV2: number = parseFloat(formatUnits(position.version == 2 ? BigInt(position.availableForMinting) : 0n, 18));

	const liquidationZCHF: number = parseInt(position.price) / 10 ** (36 - position.collateralDecimals);
	const collateralCapacity: number = balance * liquidationZCHF - loanZCHF;
	const personalizedAvailableV1: number = Math.max(0, Math.min(loanAvailableV1, collateralCapacity));
	const personalizedAvailableV2: number = Math.max(0, Math.min(loanAvailableV2, collateralCapacity));
	const liquidationPct: number = (balanceZCHF / (liquidationZCHF * balance)) * 100;

	const positionChallenges = challenges.map[normalizeAddress(position.position)] ?? [];
	const positionChallengesActive = positionChallenges.filter((ch: ChallengesQueryItem) => ch.status == "Active") ?? [];

	const states: string[] = ["Closed", "Challenged", "New Request", "Cooldown", "Expiring Soon", "Expired", "Open"];
	let stateIdx: number = states.length;
	let stateTimePrint: string = "";
	let stateChallengeInfo: ChallengeInfos;

	if (position.closed || position.denied) {
		stateIdx = 0;
		stateTimePrint = "";
	} else if (positionChallengesActive.length > 0) {
		stateIdx = 1;

		const declineTimestamps: { [key: number]: ChallengeInfos } = {};
		for (const c of positionChallengesActive) {
			const _start: number = parseInt(c.start.toString()) * 1000;
			const _duration: number = parseInt(c.duration.toString()) * 1000;
			const _maturity: number = Math.min(...[position.expiration * 1000, _start + 2 * _duration]);
			const _time2exp: number = Math.round((_maturity - Date.now()) / 1000);
			const _isQuick: boolean = _start + 2 * _duration > _maturity;
			const _decline: number = _isQuick ? _start : _start + _duration;

			declineTimestamps[_decline] = {
				start: _start,
				duration: _duration,
				maturity: _maturity,
				time2exp: _time2exp,
				isQuick: _isQuick,
				decline: _decline,
				challenge: c,
			};
		}

		const lowestDeclineTimestamp: number = Math.min(...Object.keys(declineTimestamps).map((v) => parseInt(v)));
		stateChallengeInfo = declineTimestamps[lowestDeclineTimestamp];

		const diff: number = lowestDeclineTimestamp - Date.now();
		const d: number = Math.floor(diff / 1000 / 60 / 60 / 24);
		const h: number = Math.floor((diff / 1000 / 60 / 60 / 24 - d) * 24);
		const m: number = Math.floor(diff / 1000 / 60 - d * 24 * 60 - h * 60);

		stateTimePrint = diff > 0 ? `${d}d ${h}h ${m}m` : "0d 0h 0m";
	} else if (position.start * 1000 > Date.now()) {
		const diff: number = position.start * 1000 - Date.now();
		const d: number = Math.floor(diff / 1000 / 60 / 60 / 24);
		const h: number = Math.floor((diff / 1000 / 60 / 60 / 24 - d) * 24);
		const m: number = Math.floor(diff / 1000 / 60 - d * 24 * 60 - h * 60);
		stateIdx = 2;
		stateTimePrint = `${d}d ${h}h ${m}m`;
	} else if (position.cooldown * 1000 > Date.now()) {
		const diff: number = position.cooldown * 1000 - Date.now();
		const d: number = Math.floor(diff / 1000 / 60 / 60 / 24);
		const h: number = Math.floor((diff / 1000 / 60 / 60 / 24 - d) * 24);
		const m: number = Math.floor(diff / 1000 / 60 - d * 24 * 60 - h * 60);
		stateIdx = 3;
		stateTimePrint = `${d}d ${h}h ${m}m`;
	} else if (maturity < 7) {
		if (maturity > 0) {
			stateIdx = 4;
			if (maturity < 3) {
				stateTimePrint = `${formatCurrency(maturity * 24)} hours`;
			} else {
				stateTimePrint = `${formatCurrency(maturity)} days`;
			}
		} else {
			stateIdx = 5;
			stateTimePrint = ``;
		}
	} else {
		stateIdx = 6;
		stateTimePrint = `${Math.round(maturity)} days`;
	}

	function navigateToChallenge() {
		if (stateIdx != 1) return;
		try {
			navigate.push(`challenges/${stateChallengeInfo.challenge.number}/bid`, { scroll: true });
		} catch (error) {
			console.log(error);
		}
	}

	const stateIsWarning = stateIdx != 6;
	const availableForLoan = position.version == 2 ? personalizedAvailableV2 : personalizedAvailableV1;

	return (
		<TableRow
			headers={headers}
			tab={tab}
			actionCol={
				<button
					type="button"
					onClick={() => navigate.push(`/mypositions/${position.position}`)}
					className="group inline-flex items-center gap-1.5 px-1 py-2 text-[13px] font-semibold text-text-active cursor-pointer transition-[gap] duration-150 ease-out hover:gap-2.5"
				>
					Manage
					<span className="transition-transform duration-150 ease-out group-hover:translate-x-1" aria-hidden>
						→
					</span>
				</button>
			}
		>
			{/* Collateral */}
			<div className="flex flex-col max-md:mb-5">
				<div className="max-md:hidden">
					<MyPositionsDisplayCollateral position={position} collateralPrice={collTokenPrice} zchfPrice={zchfPrice} />
				</div>
				<AppBox className="md:hidden">
					<MyPositionsDisplayCollateral
						className={"justify-items-center items-center"}
						position={position}
						collateralPrice={collTokenPrice}
						zchfPrice={zchfPrice}
					/>
				</AppBox>
			</div>

			{/* Liquidation */}
			<div className="flex flex-col items-end">
				<span className={`text-[15px] ${liquidationPct < 110 ? "font-semibold text-text-warning" : "text-text-primary"}`}>
					<span className="font-mono">{formatCurrency(liquidationZCHF, 2, 2)}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
				<span className="mt-0.5 font-mono text-[11px] text-text-secondary">
					{formatCurrency(collTokenPrice / zchfPrice, 2, 2)} market
				</span>
			</div>

			{/* Minted */}
			<div className="flex flex-col items-end">
				<span className="text-[15px] text-text-primary">
					<span className="font-mono">{formatCurrency(loanZCHF, 2, 2)}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary">ZCHF</span>
				</span>
				<span className="mt-0.5 font-mono text-[11px] text-text-secondary">
					{formatCurrency(availableForLoan, 2, 2)} avail
				</span>
			</div>

			{/* State */}
			<div className="flex flex-col items-end">
				<span className={`text-[15px] ${stateIsWarning ? "font-semibold text-text-warning" : "text-text-primary"}`}>
					{states[stateIdx]}
				</span>
				{stateTimePrint && (
					<span
						className={`mt-0.5 font-mono text-[11px] text-text-secondary ${stateIdx == 1 ? "underline cursor-pointer" : ""}`}
						onClick={navigateToChallenge}
					>
						{stateTimePrint}
					</span>
				)}
			</div>
		</TableRow>
	);
}
