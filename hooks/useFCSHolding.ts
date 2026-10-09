import { useConnection, useReadContracts } from "wagmi";
import { decodeBigIntCall } from "@utils";
import { Address, zeroAddress } from "viem";
import { ADDRESS, EquityABI, FCSABI } from "@frankencoin/zchf";
import { mainnet } from "viem/chains";

// Small read for holding cards: the FPS price and the FCS holding duration. No refetch on every block.
export const useFCSHolding = (accountOverride?: Address) => {
	const { address } = useConnection();
	const account = accountOverride || address || zeroAddress;

	const { data } = useReadContracts({
		contracts: [
			{
				address: ADDRESS[mainnet.id].equity,
				chainId: mainnet.id,
				abi: EquityABI,
				functionName: "price",
			},
			{
				address: ADDRESS[mainnet.id].fcs,
				chainId: mainnet.id,
				abi: FCSABI,
				functionName: "holdingDuration",
				args: [account],
			},
		],
	});

	const equityPrice: bigint = data ? decodeBigIntCall(data[0]) : 0n;
	const fcsHoldingDuration: bigint = data ? decodeBigIntCall(data[1]) : 0n;

	return { equityPrice, fcsHoldingDuration };
};
