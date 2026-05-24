import React, { useEffect, useState } from "react";
import { usePoolStats } from "@hooks";
import { formatBigInt, shortenAddress } from "@utils";
import { useConnection, useBlockNumber } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { erc20Abi, formatUnits, zeroAddress } from "viem";
import AppButton from "@components/AppButton";
import { TxToast, renderErrorTxToast } from "@components/TxToast";
import { track } from "@hooks";
import { toast } from "react-toastify";
import { WAGMI_CONFIG } from "../../app.config";
import { ADDRESS, EquityABI, FPSWrapperABI } from "@frankencoin/zchf";
import { mainnet } from "viem/chains";
import GuardSupportedChain from "@components/Guards/GuardSupportedChain";
import {
	EquityFlatAmountInput,
	EquityHeroPositionStats,
	EquityWideSwapPill,
} from "./EquityCardElements";

interface Props {
	tokenFromTo: { from: string; to: string };
	setTokenFromTo: (set: { from: string; to: string }) => void;
	selectorMapping: { [key: string]: string[] };
}

export default function EquityInteractionWithWFPSRedeem({ tokenFromTo, setTokenFromTo, selectorMapping }: Props) {
	const [amount, setAmount] = useState(0n);
	const [error, setError] = useState("");
	const [isApproving, setApproving] = useState(false);
	const [isRedeeming, setRedeeming] = useState(false);
	const [wfpsAllowance, setWfpsAllowance] = useState<bigint>(0n);
	const [wfpsBalance, setWfpsBalance] = useState<bigint>(0n);
	const [wfpsHolding, setWfpsHolding] = useState<bigint>(0n);
	const [calculateProceeds, setCalculateProceeds] = useState<bigint>(0n);

	const { data } = useBlockNumber({ watch: true });
	const { address } = useConnection();
	const poolStats = usePoolStats();
	const chainId = mainnet.id;
	const account = address || zeroAddress;

	useEffect(() => {
		setAmount(0n);
		setError("");
	}, [tokenFromTo]);

	useEffect(() => {
		const fetchAsync = async function () {
			if (account != zeroAddress) {
				const _wfpsAllowance = await readContract(WAGMI_CONFIG, {
					address: ADDRESS[chainId].wFPS,
					chainId: chainId,
					abi: erc20Abi,
					functionName: "allowance",
					args: [account, ADDRESS[chainId].wFPS],
				});
				setWfpsAllowance(_wfpsAllowance);

				const _wfpsBalance = await readContract(WAGMI_CONFIG, {
					address: ADDRESS[chainId].wFPS,
					chainId: chainId,
					abi: erc20Abi,
					functionName: "balanceOf",
					args: [account],
				});
				setWfpsBalance(_wfpsBalance);
			}

			const _wfpsHolding = await readContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].equity,
				chainId: chainId,
				abi: EquityABI,
				functionName: "holdingDuration",
				args: [ADDRESS[chainId].wFPS],
			});
			setWfpsHolding(_wfpsHolding);
		};

		fetchAsync();
	}, [data, account, chainId]);

	useEffect(() => {
		const fetchAsync = async function () {
			const _calculateProceeds = await readContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].equity,
				chainId: chainId,
				abi: EquityABI,
				functionName: "calculateProceeds",
				args: [amount],
			});
			setCalculateProceeds(_calculateProceeds);
		};

		fetchAsync();
	}, [chainId, amount]);

	const handleApprove = async () => {
		try {
			setApproving(true);
			const approveWriteHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].wFPS,
				chainId: chainId,
				abi: erc20Abi,
				functionName: "approve",
				args: [ADDRESS[chainId].wFPS, amount],
			});
			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount) + " WFPS" },
				{ title: "Spender: ", value: shortenAddress(ADDRESS[chainId].wFPS) },
				{ title: "Transaction:", hash: approveWriteHash },
			];
			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: approveWriteHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Approving WFPS`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Approved WFPS" rows={toastContent} /> },
			});
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setApproving(false);
		}
	};

	const handleRedeem = async () => {
		try {
			setRedeeming(true);
			const writeHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].wFPS,
				chainId: chainId,
				abi: FPSWrapperABI,
				functionName: "unwrapAndSell",
				args: [amount],
			});
			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount) + " WFPS" },
				{ title: "Receive: ", value: formatBigInt(calculateProceeds) + " ZCHF" },
				{ title: "Transaction: ", hash: writeHash },
			];
			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: writeHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Unwrap and Redeeming WFPS`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Redeemed WFPS" rows={toastContent} /> },
			});
			track("wfps_redeemed", { wfps: formatBigInt(amount), zchf: formatBigInt(calculateProceeds, 18) });
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setAmount(0n);
			setRedeeming(false);
		}
	};

	const fromSymbol = "WFPS";
	const toSymbol = "ZCHF";
	const unlocked = wfpsHolding > 86_400 * 90 && wfpsHolding < 86_400 * 365 * 30;
	const redeemLeft = unlocked ? 0n : 86_400n * 90n - wfpsHolding;

	const onChangeAmount = (value: string) => {
		const valueBigInt = BigInt(value);
		setAmount(valueBigInt);
		if (valueBigInt > wfpsBalance) {
			setError(`Not enough ${fromSymbol} in your wallet.`);
		} else {
			setError("");
		}
	};

	const handleTokenFromChange = (t: string) => {
		setTokenFromTo({ from: t, to: selectorMapping[t][0] });
	};
	const handleTokenToChange = (t: string) => {
		setTokenFromTo({ from: tokenFromTo.from, to: t });
	};

	const conversionNote = () => {
		if (amount != 0n && calculateProceeds != 0n) {
			const ratio = (calculateProceeds * BigInt(1e18)) / amount;
			return `1 ${fromSymbol} = ${formatUnits(ratio, 18)} ${toSymbol}`;
		}
		return "";
	};

	const wfpsValue = (poolStats.equityPrice * wfpsBalance) / BigInt(1e18);

	return (
		<>
			<EquityFlatAmountInput
				label="Send"
				tokens={Object.keys(selectorMapping)}
				activeToken={fromSymbol}
				onTokenChange={handleTokenFromChange}
				value={amount.toString()}
				onChange={onChangeAmount}
				max={wfpsBalance}
				balance={wfpsBalance}
				error={error}
			/>

			<EquityWideSwapPill fromSymbol={fromSymbol} toSymbol={toSymbol} onClick={() => {}} disabled />

			<EquityFlatAmountInput
				label="Receive"
				tokens={selectorMapping[fromSymbol] || []}
				activeToken={toSymbol}
				onTokenChange={handleTokenToChange}
				value={calculateProceeds.toString()}
				readOnly
			/>

			<div className="px-1 text-sm text-text-secondary font-mono min-h-[1.25rem]">{conversionNote()}</div>

			<GuardSupportedChain chain={mainnet}>
				{amount > wfpsAllowance ? (
					<AppButton
						isLoading={isApproving}
						disabled={amount == 0n || !!error || !unlocked}
						onClick={() => handleApprove()}
					>
						Approve
					</AppButton>
				) : (
					<AppButton
						isLoading={isRedeeming}
						disabled={amount == 0n || !!error || !unlocked}
						onClick={() => handleRedeem()}
					>
						Unwrap and Redeem
					</AppButton>
				)}
			</GuardSupportedChain>

			<EquityHeroPositionStats
				tokenSymbol="WFPS"
				balance={wfpsBalance}
				value={wfpsValue}
				valueSymbol="ZCHF"
				holdingSeconds={wfpsHolding}
				redeemLeftSeconds={redeemLeft > 0n ? redeemLeft : 0n}
				ready={unlocked}
			/>
		</>
	);
}
