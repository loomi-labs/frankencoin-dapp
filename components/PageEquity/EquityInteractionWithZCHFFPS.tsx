import React, { useEffect, useState } from "react";
import { usePoolStats } from "@hooks";
import { formatBigInt, shortenAddress } from "@utils";
import { useConnection, useReadContract } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { erc20Abi, formatUnits, zeroAddress } from "viem";
import AppButton from "@components/AppButton";
import { TxToast, renderErrorTxToast } from "@components/TxToast";
import { track } from "@hooks";
import { toast } from "react-toastify";
import { WAGMI_CONFIG } from "../../app.config";
import { ADDRESS, EquityABI } from "@frankencoin/zchf";
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

export default function EquityInteractionWithZCHFFPS({ tokenFromTo, setTokenFromTo, selectorMapping }: Props) {
	const [amount, setAmount] = useState(0n);
	const [error, setError] = useState("");
	const [isApproving, setApproving] = useState(false);
	const [isInversting, setInversting] = useState(false);
	const [isRedeeming, setRedeeming] = useState(false);

	const { address } = useConnection();
	const chainId = mainnet.id;
	const poolStats = usePoolStats();
	const account = address || zeroAddress;
	const direction: boolean = tokenFromTo.from === "ZCHF";

	useEffect(() => {
		setAmount(0n);
		setError("");
	}, [tokenFromTo]);

	const handleApprove = async () => {
		try {
			setApproving(true);

			const approveWriteHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].frankencoin,
				chainId: chainId,
				abi: erc20Abi,
				functionName: "approve",
				args: [ADDRESS[chainId].equity, amount],
			});

			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount) + " ZCHF" },
				{ title: "Spender: ", value: shortenAddress(ADDRESS[chainId].equity) },
				{ title: "Transaction:", hash: approveWriteHash },
			];

			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: approveWriteHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Approving ZCHF`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Approved ZCHF" rows={toastContent} /> },
			});
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setApproving(false);
		}
	};
	const handleInvest = async () => {
		try {
			const investWriteHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].equity,
				chainId: chainId,
				abi: EquityABI,
				functionName: "invest",
				args: [amount, result],
			});

			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount, 18) + " ZCHF" },
				{ title: "Shares: ", value: formatBigInt(result) + " FPS" },
				{ title: "Transaction: ", hash: investWriteHash },
			];

			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: investWriteHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Investing ZCHF`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Invested" rows={toastContent} /> },
			});

			track("fps_invested", { zchf: formatBigInt(amount, 18), fps: formatBigInt(result) });
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setAmount(0n);
			setInversting(false);
		}
	};
	const handleRedeem = async () => {
		try {
			setRedeeming(true);

			const redeemWriteHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].equity,
				chainId: chainId,
				abi: EquityABI,
				functionName: "redeem",
				args: [account, amount],
			});

			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount) + " FPS" },
				{ title: "Receive: ", value: formatBigInt(result) + " ZCHF" },
				{ title: "Transaction: ", hash: redeemWriteHash },
			];

			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: redeemWriteHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Redeeming FPS`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Redeemed" rows={toastContent} /> },
			});

			track("fps_redeemed", { fps: formatBigInt(amount), zchf: formatBigInt(result, 18) });
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setAmount(0n);
			setRedeeming(false);
		}
	};

	const { data: fpsResult } = useReadContract({
		address: ADDRESS[chainId].equity,
		chainId: chainId,
		abi: EquityABI,
		functionName: "calculateShares",
		args: [amount],
	});

	const { data: frankenResult } = useReadContract({
		address: ADDRESS[chainId].equity,
		chainId: chainId,
		abi: EquityABI,
		functionName: "calculateProceeds",
		args: [amount],
	});

	const fromBalance = direction ? poolStats.frankenBalance : poolStats.equityBalance;
	const result = (direction ? fpsResult : frankenResult) || 0n;
	const fromSymbol = direction ? "ZCHF" : "FPS";
	const toSymbol = !direction ? "ZCHF" : "FPS";
	const redeemLeft =
		86400n * 90n - (poolStats.equityBalance ? poolStats.equityUserVotes / poolStats.equityBalance / 2n ** 20n : 0n);
	const ready = poolStats.equityCanRedeem;

	const onChangeAmount = (value: string) => {
		const valueBigInt = BigInt(value);
		setAmount(valueBigInt);
		if (valueBigInt > fromBalance) {
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
	const handleSwap = () => {
		setTokenFromTo({ from: toSymbol, to: fromSymbol });
	};

	const conversionNote = () => {
		if (amount != 0n && result != 0n) {
			const ratio = (100n * amount) / result;
			return `1 ${toSymbol} = ${formatUnits(ratio, 2)} ${fromSymbol}`;
		}
		return "";
	};

	const investorBalance = poolStats.equityBalance;
	const investorValue = (poolStats.equityPrice * investorBalance) / BigInt(1e18);

	return (
		<>
			<EquityFlatAmountInput
				label="Send"
				tokens={Object.keys(selectorMapping)}
				activeToken={fromSymbol}
				onTokenChange={handleTokenFromChange}
				value={amount.toString()}
				onChange={onChangeAmount}
				max={fromBalance}
				balance={fromBalance}
				error={error}
			/>

			<EquityWideSwapPill fromSymbol={fromSymbol} toSymbol={toSymbol} onClick={handleSwap} />

			<EquityFlatAmountInput
				label="Receive"
				tokens={selectorMapping[fromSymbol] || []}
				activeToken={toSymbol}
				onTokenChange={handleTokenToChange}
				value={result.toString()}
				readOnly
			/>

			<div className="px-1 text-sm text-text-secondary font-mono min-h-[1.25rem]">{conversionNote()}</div>

			<GuardSupportedChain chain={mainnet}>
				{direction ? (
					amount > poolStats.frankenAllowance ? (
						<AppButton isLoading={isApproving} disabled={amount == 0n || !!error} onClick={() => handleApprove()}>
							Approve
						</AppButton>
					) : (
						<AppButton disabled={amount == 0n || !!error} isLoading={isInversting} onClick={() => handleInvest()}>
							Mint
						</AppButton>
					)
				) : (
					<AppButton
						isLoading={isRedeeming}
						disabled={amount == 0n || !!error || !poolStats.equityCanRedeem}
						onClick={() => handleRedeem()}
					>
						Redeem
					</AppButton>
				)}
			</GuardSupportedChain>

			<EquityHeroPositionStats
				tokenSymbol="FPS"
				balance={investorBalance}
				value={investorValue}
				valueSymbol="ZCHF"
				holdingSeconds={poolStats.equityHoldingDuration}
				redeemLeftSeconds={redeemLeft > 0n ? redeemLeft : 0n}
				ready={!!ready}
			/>
		</>
	);
}
