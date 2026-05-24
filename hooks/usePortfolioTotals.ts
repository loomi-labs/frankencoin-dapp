import { useSelector } from "react-redux";
import { Address, formatUnits } from "viem";
import { RootState } from "../redux/redux.store";
import { normalizeAddress } from "../utils/format";

export type PortfolioTotals = {
	totalOwed: bigint;
	totalMinted: bigint;
	totalReserves: bigint;
	valueLockedChf: number;
};

export const usePortfolioTotals = (account: Address): PortfolioTotals => {
	const positions = useSelector((state: RootState) => state.positions.openPositions);
	const prices = useSelector((state: RootState) => state.prices.coingecko);

	const owned = positions.filter((p) => normalizeAddress(p.owner) === normalizeAddress(account));

	let totalMinted = 0n;
	let totalReserves = 0n;
	let valueLockedChf = 0;

	for (const p of owned) {
		const minted = BigInt(p.minted);
		const reserve = BigInt(p.reserveContribution);
		totalMinted += minted;
		totalReserves += (minted * reserve) / 1_000_000n;

		const balance = parseFloat(formatUnits(BigInt(p.collateralBalance), p.collateralDecimals));
		const price = prices[normalizeAddress(p.collateral)]?.price?.chf ?? 0;
		valueLockedChf += balance * price;
	}

	const totalOwed = totalMinted - totalReserves;

	return { totalOwed, totalMinted, totalReserves, valueLockedChf };
};
