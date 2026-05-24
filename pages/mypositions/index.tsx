import Head from "next/head";
import MypositionsTable from "@components/PageMypositions/MypositionsTable";
import MyPositionsChallengesTable from "@components/PageMypositions/MyPositionsChallengesTable";
import MyPositionsBidsTable from "@components/PageMypositions/MyPositionsBidsTable";
import MyPortfolioTotalsCard from "@components/PageMypositions/MyPortfolioTotalsCard";
import MyPortfolioHoldingsGrid from "@components/PageMypositions/MyPortfolioHoldingsGrid";
import { useRouter } from "next/router";
import { Address, isAddress, zeroAddress } from "viem";
import { normalizeAddress, shortenAddress } from "@utils";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, store } from "../../redux/redux.store";
import { fetchPositionsList } from "../../redux/slices/positions.slice";
import { fetchChallengesList } from "../../redux/slices/challenges.slice";
import { fetchBidsList } from "../../redux/slices/bids.slice";
import { fetchSavings } from "../../redux/slices/savings.slice";
import AppTitle from "@components/AppTitle";
import AppCard from "@components/AppCard";
import AppLink from "@components/AppLink";
import { useContractUrl } from "@hooks";
import { useConnection } from "wagmi";
import ReportsPositionsYearlyTable from "@components/PageReports/ReportsPositionsYearlyTable";
import { OwnerPositionDebt, OwnerPositionFees, OwnerPositionValueLocked } from "../report";
import { FRANKENCOIN_API_CLIENT } from "../../app.config";
import { ApiOwnerDebt, ApiOwnerValueLocked } from "@frankencoin/api";

export default function Positions() {
	const { address } = useConnection();
	const router = useRouter();
	const paramAddr = router.query.address as Address;
	const overwrite: Address | undefined = isAddress(paramAddr) ? paramAddr : undefined;

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const [ownerPositionFees, setOwnerPositionFees] = useState<OwnerPositionFees[]>([]);
	const [ownerPositionDebt, setOwnerPositionDebt] = useState<OwnerPositionDebt[]>([]);
	const [ownerPositionValueLocked, setOwnerPositionValueLocked] = useState<OwnerPositionValueLocked[]>([]);

	useEffect(() => {
		store.dispatch(fetchPositionsList());
		store.dispatch(fetchChallengesList());
		store.dispatch(fetchBidsList());
	}, []);

	const portfolioAccount = (overwrite || address || zeroAddress) as Address;

	useEffect(() => {
		if (portfolioAccount !== zeroAddress) {
			store.dispatch(fetchSavings(portfolioAccount));
		}
	}, [portfolioAccount]);

	useEffect(() => {
		if (address == undefined && overwrite == undefined) {
			setOwnerPositionFees([]);
			setOwnerPositionDebt([]);
			setError("");
			return;
		}

		setLoading(true);
		const fetcher = async () => {
			try {
				const responsePositionsFees = await FRANKENCOIN_API_CLIENT.get(`/positions/owner/${overwrite || address}/fees`);
				setOwnerPositionFees((responsePositionsFees.data as { t: number; f: string }[]).map((i) => ({ t: i.t, f: BigInt(i.f) })));

				const responsePositionsDebt = await FRANKENCOIN_API_CLIENT.get(`/positions/owner/${overwrite || address}/debt`);
				const debt = responsePositionsDebt.data as ApiOwnerDebt;

				const yearly: OwnerPositionDebt[] = Object.keys(debt).map((y) => ({
					y: Number(y),
					d: BigInt(debt[Number(y)]),
				}));

				setOwnerPositionDebt(yearly);

				const responsePositionsValueLocked = await FRANKENCOIN_API_CLIENT.get(`/prices/owner/${overwrite || address}/valueLocked`);
				const value = responsePositionsValueLocked.data as ApiOwnerValueLocked;

				const yearlyValue: OwnerPositionValueLocked[] = Object.keys(value).map((y) => ({
					y: Number(y),
					v: BigInt(value[Number(y)]),
				}));

				setOwnerPositionValueLocked(yearlyValue);

				// clear all errors
				setError("");
			} catch (error) {
				if (typeof error == "string") {
					setError(error);
				} else {
					setError("Something did not work correctly");
				}
			}
		};

		fetcher();
		setLoading(false);
	}, [address, overwrite]);

	const openPositions = useSelector((state: RootState) => state.positions.openPositions);
	const challengesList = useSelector((state: RootState) => state.challenges.list.list);
	const bidsList = useSelector((state: RootState) => state.bids.list.list);

	const accountLower = normalizeAddress(portfolioAccount);
	const hasPositions = portfolioAccount !== zeroAddress && openPositions.some((p) => normalizeAddress(p.owner) === accountLower);
	const hasChallenges = portfolioAccount !== zeroAddress && challengesList.some((c) => normalizeAddress(c.challenger) === accountLower);
	const hasBids = portfolioAccount !== zeroAddress && bidsList.some((b) => normalizeAddress(b.bidder) === accountLower);
	const hasYearly = ownerPositionDebt.length > 0 || ownerPositionFees.length > 0 || ownerPositionValueLocked.length > 0;

	const hasAnyActivity = hasPositions || hasChallenges || hasBids || hasYearly;
	const isWalletAttached = portfolioAccount !== zeroAddress;

	return (
		<>
			<Head>
				<title>Frankencoin - Dashboard</title>
			</Head>

			<AppTitle title="Dashboard" subtitle={<DisplayWarningMessage overwrite={overwrite} />} />

			{/* Section Portfolio Overview */}
			<MyPortfolioTotalsCard account={portfolioAccount} />

			<MyPortfolioHoldingsGrid account={portfolioAccount} />

			{isWalletAttached && !hasAnyActivity && (
				<AppCard>
					<div className="text-text-primary font-medium">No activity yet</div>
					<div className="text-text-secondary text-sm">
						You don&apos;t have any positions, challenges, or bids yet. Visit{" "}
						<AppLink className="inline" label="Get ZCHF" href="/mint" /> to mint your first position.
					</div>
				</AppCard>
			)}

			{hasPositions && (
				<>
					<AppTitle title="Owned Positions" />
					<MypositionsTable />
				</>
			)}

			{hasYearly && (
				<>
					<AppTitle title="Yearly Accounts">
						<DisplayWarningMessage overwrite={overwrite} />
						<div className="text-text-secondary">
							Open positions at the end of each year as well as interest paid. See also the{" "}
							<AppLink className="" label={"report page"} href={`/report?address=${overwrite ?? address ?? zeroAddress}`} />.
						</div>
					</AppTitle>

					<ReportsPositionsYearlyTable
						address={overwrite ?? address ?? zeroAddress}
						ownerPositionFees={ownerPositionFees}
						ownerPositionDebt={ownerPositionDebt}
						ownerPositionValueLocked={ownerPositionValueLocked}
					/>
				</>
			)}

			{hasChallenges && (
				<>
					<AppTitle title="Initiated Challenges">
						<DisplayWarningMessage overwrite={overwrite} />
					</AppTitle>

					<MyPositionsChallengesTable />
				</>
			)}

			{hasBids && (
				<>
					<AppTitle title="Your Bids">
						<DisplayWarningMessage overwrite={overwrite} />
					</AppTitle>

					<MyPositionsBidsTable />
				</>
			)}
		</>
	);
}

function DisplayWarningMessage(props: { overwrite: Address | undefined }) {
	const link = useContractUrl(props.overwrite ?? zeroAddress);
	if (props.overwrite == undefined) return;

	return (
		<div>
			<div className="font-bold text-sm">
				Public View for: {<AppLink className="" label={shortenAddress(props.overwrite)} href={link} external={true} />}
			</div>
		</div>
	);
}
