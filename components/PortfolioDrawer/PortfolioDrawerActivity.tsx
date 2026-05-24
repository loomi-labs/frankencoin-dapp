import { useSelector } from "react-redux";
import Link from "next/link";
import { Address } from "viem";
import { RootState } from "../../redux/redux.store";
import { normalizeAddress } from "../../utils/format";
import PortfolioDrawerSection from "./PortfolioDrawerSection";

export default function PortfolioDrawerActivity({ account }: { account: Address }) {
	const challenges = useSelector((state: RootState) => state.challenges.list.list);
	const bids = useSelector((state: RootState) => state.bids.list.list);
	const positionsMap = useSelector((state: RootState) => state.positions.mapping.map);

	const myActiveChallenges = challenges.filter(
		(c) => normalizeAddress(c.challenger) === normalizeAddress(account) && c.status === "Active"
	);
	const myBids = bids.filter((b) => normalizeAddress(b.bidder) === normalizeAddress(account));

	return (
		<>
			<PortfolioDrawerSection title="Active challenges" count={myActiveChallenges.length} defaultOpen={false}>
				{myActiveChallenges.length === 0 ? (
					<div className="text-xs text-text-secondary py-1">No active challenges.</div>
				) : (
					myActiveChallenges.map((c) => {
						const pos = positionsMap[normalizeAddress(c.position)];
						const symbol = pos?.collateralSymbol ?? "?";
						return (
							<Link
								key={`${c.position}-${c.number}`}
								href={`/challenges/${c.number}/bid`}
								className="flex items-center justify-between rounded-lg bg-card-content-primary px-2 py-2 hover:bg-menu-hover transition-colors"
							>
								<span className="text-sm text-text-primary">Challenge #{String(c.number)}</span>
								<span className="text-xs text-text-secondary">{symbol}</span>
							</Link>
						);
					})
				)}
			</PortfolioDrawerSection>

			<PortfolioDrawerSection title="Your bids" count={myBids.length} defaultOpen={false}>
				{myBids.length === 0 ? (
					<div className="text-xs text-text-secondary py-1">No bids placed.</div>
				) : (
					myBids.slice(0, 10).map((b, idx) => {
						const pos = positionsMap[normalizeAddress(b.position)];
						const symbol = pos?.collateralSymbol ?? "?";
						return (
							<Link
								key={`${b.position}-${b.number}-${idx}`}
								href={`/challenges/${b.number}/bid`}
								className="flex items-center justify-between rounded-lg bg-card-content-primary px-2 py-2 hover:bg-menu-hover transition-colors"
							>
								<span className="text-sm text-text-primary">Bid on #{String(b.number)}</span>
								<span className="text-xs text-text-secondary">{symbol}</span>
							</Link>
						);
					})
				)}
			</PortfolioDrawerSection>
		</>
	);
}
