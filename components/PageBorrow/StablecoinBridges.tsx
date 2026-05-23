import { useSwapCHFAUStats } from "@hooks";
import StablecoinBridgeCard from "./StablecoinBridgeCard";

export default function StablecoinBridges() {
	const chfau = useSwapCHFAUStats();

	const bridges = [chfau];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
			{bridges.map((b) => (
				<StablecoinBridgeCard key={b.bridgeAddress} stats={b} />
			))}
		</div>
	);
}
