import { useSelector } from "react-redux";
import { RootState } from "../../redux/redux.store";
import MonitoringAllChallengesRow from "./MonitoringAllChallengesRow";
import { useMemo } from "react";
import { BidsQueryItem, ChallengesQueryItem } from "@frankencoin/api";
import AppCard from "@components/AppCard";

export default function MonitoringAllChallengesTable() {
	const challenges = useSelector((state: RootState) => state.challenges.list.list);
	const bidsByChallenges = useSelector((state: RootState) => state.bids.challenges.map);

	const sorted = useMemo(() => {
		return [...challenges].sort((a, b) => {
			return parseInt(b.start.toString()) - parseInt(a.start.toString());
		});
	}, [challenges]);

	if (sorted.length === 0) {
		return (
			<AppCard className="p-8 text-center text-text-secondary">No challenges have been recorded yet.</AppCard>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{sorted.map((challenge: ChallengesQueryItem) => {
				const bids: BidsQueryItem[] = bidsByChallenges[challenge.id] ?? [];
				return <MonitoringAllChallengesRow key={challenge.id} challenge={challenge} bids={bids} />;
			})}
		</div>
	);
}
