import Head from "next/head";
import { useEffect, useState } from "react";
import { useContractUrl, useSwapVCHFStats, useSwapCHFAUStats } from "@hooks";
import { useRouter } from "next/router";
import { erc20Abi, formatUnits, maxUint256 } from "viem";
import AppButton from "@components/AppButton";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { toast } from "react-toastify";
import { formatBigInt, formatCurrency, shortenAddress } from "@utils";
import { TxToast, renderErrorTxToast } from "@components/TxToast";
import { WAGMI_CONFIG } from "../app.config";
import AppCard from "@components/AppCard";
import { FrankencoinABI } from "@frankencoin/zchf";
import AppLink from "@components/AppLink";
import GuardSupportedChain from "@components/Guards/GuardSupportedChain";
import { EquityFlatAmountInput, EquityWideSwapPill } from "@components/PageEquity/EquityCardElements";

export default function Swap() {
	const [amount, setAmount] = useState(0n);
	const [error, setError] = useState("");
	const [errorBridge, setErrorBridge] = useState("");
	const [direction, setDirection] = useState(true);
	const [isApproving, setApproving] = useState(false);
	const [isMinting, setMinting] = useState(false);
	const [isBurning, setBurning] = useState(false);
	const [isMinter, setMinter] = useState<bigint>(0n);

	const router = useRouter();
	const vchfStats = useSwapVCHFStats();
	const chfauStats = useSwapCHFAUStats();
	const swapStats = (router.query.token as string)?.toUpperCase() === "VCHF" ? vchfStats : chfauStats;

	const { chain, chainId, otherAddress: other, bridgeAddress: bridge, frankencoinAddress, bridgeAbi, otherDecimals } = swapStats;
	const bridgeUrl = useContractUrl(bridge);

	const fromDecimals = direction ? otherDecimals : 18;
	const toDecimals = direction ? 18 : otherDecimals;
	const decimalDiff = toDecimals - fromDecimals;
	const toAmount =
		decimalDiff > 0
			? amount * BigInt(10) ** BigInt(decimalDiff)
			: decimalDiff < 0
			? amount / BigInt(10) ** BigInt(-decimalDiff)
			: amount;

	// Reset state when switching bridges; init direction to burn if already expired
	useEffect(() => {
		setAmount(0n);
		setMinter(0n);
	}, [bridge]);

	useEffect(() => {
		if (swapStats.bridgeHorizon === 0n) return;
		const expired = swapStats.bridgeHorizon * 1000n < BigInt(Date.now());
		setDirection(!expired);
	}, [swapStats.bridgeHorizon, bridge]);

	const activeMinter = isMinter > 0 && isMinter * 1000n <= Date.now();
	const fromBalance = direction ? swapStats.otherUserBal : swapStats.zchfUserBal;
	const fromSymbol = direction ? swapStats.otherSymbol : "ZCHF";
	const toSymbol = !direction ? swapStats.otherSymbol : "ZCHF";
	const swapLimit = direction ? swapStats.bridgeLimit - swapStats.bridgeMinted : swapStats.bridgeMinted; // (18 digits)
	const swapLimitCorrected = (swapLimit * 10n ** BigInt(fromDecimals)) / 10n ** 18n;

	useEffect(() => {
		const fetcher = async () => {
			const active = await readContract(WAGMI_CONFIG, {
				address: frankencoinAddress,
				chainId,
				abi: FrankencoinABI,
				functionName: "minters",
				args: [bridge],
			});

			if (active != isMinter) setMinter(active);
		};

		fetcher();
	}, [bridge, chainId, isMinter]);

	useEffect(() => {
		const horizon = new Date(Number(swapStats.bridgeHorizon * 1000n));
		const now = Date.now();
		const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
		const timeRemaining = horizon.getTime() - now;

		if (!activeMinter) {
			setErrorBridge("The swap module has not yet completed the governance process.");
		} else if (horizon.getTime() < now && direction) {
			setErrorBridge(`Swap module has expired on ${horizon.toDateString()}`);
		} else if (timeRemaining < thirtyDaysMs && timeRemaining > 0 && direction) {
			const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
			setErrorBridge(
				`Warning: Swap module expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} (${horizon.toDateString()})`
			);
		} else {
			setErrorBridge("");
		}
	}, [activeMinter, swapStats, direction]);

	useEffect(() => {
		if (amount > swapLimitCorrected) {
			setError(`Not enough ${toSymbol} available to swap.`);
		} else if (amount > fromBalance) {
			setError(`Not enough ${fromSymbol} in your wallet.`);
		} else {
			setError("");
		}
	}, [amount, direction, fromBalance, fromSymbol, swapLimitCorrected, toSymbol]);

	const handleApprove = async () => {
		try {
			setApproving(true);
			const approveWriteHash = await writeContract(WAGMI_CONFIG, {
				address: other,
				chainId,
				abi: erc20Abi,
				functionName: "approve",
				args: [bridge, maxUint256],
			});

			const toastContent = [
				{
					title: "Amount:",
					value: "infinite",
				},
				{
					title: "Spender: ",
					value: shortenAddress(bridge),
				},
				{
					title: "Transaction:",
					hash: approveWriteHash,
				},
			];

			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: approveWriteHash, confirmations: 1 }), {
				pending: {
					render: <TxToast title={`Approving ${fromSymbol}`} rows={toastContent} />,
				},
				success: {
					render: <TxToast title={`Successfully Approved ${fromSymbol}`} rows={toastContent} />,
				},
			});
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setApproving(false);
		}
	};
	const handleMint = async () => {
		try {
			setMinting(true);
			const mintWriteHash = await writeContract(WAGMI_CONFIG, {
				address: bridge,
				chainId,
				abi: bridgeAbi,
				functionName: "mint",
				args: [amount],
			});

			const toastContent = [
				{
					title: `${fromSymbol} Amount: `,
					value: formatBigInt(amount, fromDecimals) + " " + fromSymbol,
				},
				{
					title: `${toSymbol} Amount: `,
					value: formatBigInt(toAmount, toDecimals) + " " + toSymbol,
				},
				{
					title: "Transaction:",
					hash: mintWriteHash,
				},
			];

			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: mintWriteHash, confirmations: 1 }), {
				pending: {
					render: <TxToast title={`Swapping ${fromSymbol} to ${toSymbol}`} rows={toastContent} />,
				},
				success: {
					render: <TxToast title={`Successfully Swapped ${fromSymbol} to ${toSymbol}`} rows={toastContent} />,
				},
			});
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setMinting(false);
		}
	};
	const handleBurn = async () => {
		try {
			setBurning(true);

			const burnWriteHash = await writeContract(WAGMI_CONFIG, {
				address: bridge,
				chainId,
				abi: bridgeAbi,
				functionName: "burn",
				args: [amount],
			});

			const toastContent = [
				{
					title: `${fromSymbol} Amount: `,
					value: formatBigInt(amount, fromDecimals) + " " + fromSymbol,
				},
				{
					title: `${toSymbol} Amount: `,
					value: formatBigInt(toAmount, toDecimals) + " " + toSymbol,
				},
				{
					title: "Transaction:",
					hash: burnWriteHash,
				},
			];

			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: burnWriteHash, confirmations: 1 }), {
				pending: {
					render: <TxToast title={`Swapping ${fromSymbol} to ${toSymbol}`} rows={toastContent} />,
				},
				success: {
					render: <TxToast title={`Successfully Swapped ${fromSymbol} to ${toSymbol}`} rows={toastContent} />,
				},
			});
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setBurning(false);
		}
	};

	const onChangeDirection = () => {
		setAmount(toAmount);
		setDirection(!direction);
	};

	const onChangeAmount = (value: string) => {
		const valueBigInt = BigInt(value);
		setAmount(valueBigInt);
	};

	return (
		<>
			<Head>
				<title>Frankencoin - Swap</title>
			</Head>

			<div className="md:mt-8">
				<section className="mx-auto max-w-2xl sm:px-8">
					<AppCard className="p-8 flex flex-col gap-y-4">
						<div className="text-base font-display font-semibold text-text-primary">Swap {swapStats.otherSymbol} and ZCHF</div>

						<EquityFlatAmountInput
							label="Pay"
							value={amount.toString()}
							onChange={onChangeAmount}
							balance={fromBalance}
							max={fromBalance < swapLimitCorrected ? fromBalance : swapLimitCorrected}
							error={error}
							tokens={[fromSymbol]}
							activeToken={fromSymbol}
							onTokenChange={() => {}}
							decimals={fromDecimals}
						/>

						<EquityWideSwapPill fromSymbol={fromSymbol} toSymbol={toSymbol} onClick={onChangeDirection} />

						<EquityFlatAmountInput
							label="Receive"
							value={toAmount.toString()}
							readOnly
							error={errorBridge}
							tokens={[toSymbol]}
							activeToken={toSymbol}
							onTokenChange={() => {}}
							decimals={toDecimals}
						/>

						<div className="flex flex-row justify-between gap-2 text-sm text-text-secondary">
							<span>
								1 {fromSymbol} = 1 {toSymbol}
							</span>
							<span>
								Available {formatCurrency(formatUnits(swapLimit, 18))} <span>{toSymbol}</span>
							</span>
						</div>

						<div className="mx-auto w-full flex-col">
							<GuardSupportedChain chain={chain}>
								{direction ? (
									amount > swapStats.otherUserAllowance ? (
										<AppButton
											disabled={!activeMinter || !!error}
											isLoading={isApproving}
											onClick={() => handleApprove()}
										>
											Approve
										</AppButton>
									) : (
										<AppButton
											disabled={amount == 0n || !activeMinter || !!error}
											isLoading={isMinting}
											onClick={() => handleMint()}
										>
											Swap
										</AppButton>
									)
								) : (
									<AppButton isLoading={isBurning} disabled={amount == 0n || !!error} onClick={() => handleBurn()}>
										Swap
									</AppButton>
								)}
							</GuardSupportedChain>
						</div>
					</AppCard>

					<AppCard className="mt-8 p-8 flex flex-col gap-y-4">
						<div className="text-base font-display font-semibold text-text-primary">About the swap module</div>

						<p className="text-text-secondary leading-relaxed">
							The <AppLink className="" label="swap module" href={bridgeUrl} external={true} /> enables 1:1 conversion between
							other Swiss Franc stablecoins and back, up to certain limits. Currently,{" "}
							<AppLink className="" label={swapStats.otherLabel} href={swapStats.otherInfoUrl} external={true} /> is
							supported.
						</p>

						<p className="text-text-secondary leading-relaxed">
							You can also use the{" "}
							<AppLink
								className=""
								label="Uniswap App"
								href="https://app.uniswap.org/explore/tokens/ethereum/0xb58e61c3098d85632df34eecfb899a1ed80921cb"
								external={true}
							/>{" "}
							to swap other tokens for ZCHF.
						</p>
					</AppCard>
				</section>
			</div>
		</>
	);
}
