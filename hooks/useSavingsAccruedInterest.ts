import { useConnection, useReadContracts } from "wagmi";
import { Address, zeroAddress } from "viem";
import { arbitrum, avalanche, base, gnosis, mainnet, optimism, polygon, sonic } from "viem/chains";
import { ADDRESS, BridgedSavingsABI, ChainId, SavingsABI } from "@frankencoin/zchf";
import { decodeBigIntCall } from "@utils";

export type SavingsAccruedInterest = {
	total: bigint;
	byChain: Record<ChainId, bigint>;
};

export const useSavingsAccruedInterest = (account?: Address): SavingsAccruedInterest => {
	const { address } = useConnection();
	const target = account ?? address ?? zeroAddress;

	const contracts = [
		{
			address: ADDRESS[mainnet.id].savingsReferral,
			chainId: mainnet.id,
			abi: SavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
		{
			address: ADDRESS[polygon.id].ccipBridgedSavings,
			chainId: polygon.id,
			abi: BridgedSavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
		{
			address: ADDRESS[arbitrum.id].ccipBridgedSavings,
			chainId: arbitrum.id,
			abi: BridgedSavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
		{
			address: ADDRESS[optimism.id].ccipBridgedSavings,
			chainId: optimism.id,
			abi: BridgedSavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
		{
			address: ADDRESS[base.id].ccipBridgedSavings,
			chainId: base.id,
			abi: BridgedSavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
		{
			address: ADDRESS[avalanche.id].ccipBridgedSavings,
			chainId: avalanche.id,
			abi: BridgedSavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
		{
			address: ADDRESS[gnosis.id].ccipBridgedSavings,
			chainId: gnosis.id,
			abi: BridgedSavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
		{
			address: ADDRESS[sonic.id].ccipBridgedSavings,
			chainId: sonic.id,
			abi: BridgedSavingsABI,
			functionName: "accruedInterest" as const,
			args: [target] as const,
		},
	];

	const { data } = useReadContracts({ contracts });

	const byChain: Record<ChainId, bigint> = {
		[mainnet.id]: data ? decodeBigIntCall(data[0]) : 0n,
		[polygon.id]: data ? decodeBigIntCall(data[1]) : 0n,
		[arbitrum.id]: data ? decodeBigIntCall(data[2]) : 0n,
		[optimism.id]: data ? decodeBigIntCall(data[3]) : 0n,
		[base.id]: data ? decodeBigIntCall(data[4]) : 0n,
		[avalanche.id]: data ? decodeBigIntCall(data[5]) : 0n,
		[gnosis.id]: data ? decodeBigIntCall(data[6]) : 0n,
		[sonic.id]: data ? decodeBigIntCall(data[7]) : 0n,
	};

	const total = Object.values(byChain).reduce((acc, v) => acc + v, 0n);

	return { total, byChain };
};
