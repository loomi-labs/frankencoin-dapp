import React, { useEffect, useState } from "react";
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
	EquityDualBalanceStats,
	EquityFlatAmountInput,
	EquityWideSwapPill,
} from "./EquityCardElements";

interface Props {
	tokenFromTo: { from: string; to: string };
	setTokenFromTo: (set: { from: string; to: string }) => void;
	selectorMapping: { [key: string]: string[] };
}

export default function EquityInteractionWithFPSWFPS({ tokenFromTo, setTokenFromTo, selectorMapping }: Props) {
	const [amount, setAmount] = useState(0n);
	const [error, setError] = useState("");
	const [isApproving, setApproving] = useState(false);
	const [isWrapping, setWrapping] = useState(false);
	const [isUnwrapping, setUnwrapping] = useState(false);
	const [fpsAllowance, setFpsAllowance] = useState<bigint>(0n);
	const [fpsBalance, setFpsBalance] = useState<bigint>(0n);
	const [wfpsBalance, setWfpsBalance] = useState<bigint>(0n);
	const [fpsHolding, setFpsHolding] = useState<bigint>(0n);
	const [wfpsHolding, setWfpsHolding] = useState<bigint>(0n);

	const { data } = useBlockNumber({ watch: true });
	const { address } = useConnection();
	const chainId = mainnet.id;
	const account = address || zeroAddress;
	const direction: boolean = tokenFromTo.from === "FPS";

	useEffect(() => {
		setError("");
	}, [tokenFromTo]);

	useEffect(() => {
		const fetchAsync = async function () {
			if (account != zeroAddress) {
				const _fpsAllowance = await readContract(WAGMI_CONFIG, {
					address: ADDRESS[chainId].equity,
					chainId: chainId,
					abi: erc20Abi,
					functionName: "allowance",
					args: [account, ADDRESS[chainId].wFPS],
				});
				setFpsAllowance(_fpsAllowance);

				const _fpsBalance = await readContract(WAGMI_CONFIG, {
					address: ADDRESS[chainId].equity,
					chainId: chainId,
					abi: erc20Abi,
					functionName: "balanceOf",
					args: [account],
				});
				setFpsBalance(_fpsBalance);

				const _fpsHolding = await readContract(WAGMI_CONFIG, {
					address: ADDRESS[chainId].equity,
					chainId: chainId,
					abi: EquityABI,
					functionName: "holdingDuration",
					args: [account],
				});
				setFpsHolding(_fpsHolding);

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

	const handleApprove = async () => {
		try {
			setApproving(true);
			const writeHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].equity,
				chainId: chainId,
				abi: erc20Abi,
				functionName: "approve",
				args: [ADDRESS[chainId].wFPS, amount],
			});
			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount) + " FPS" },
				{ title: "Spender: ", value: shortenAddress(ADDRESS[chainId].wFPS) },
				{ title: "Transaction:", hash: writeHash },
			];
			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: writeHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Approving FPS`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Approved FPS" rows={toastContent} /> },
			});
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setApproving(false);
		}
	};
	const handleWrapping = async () => {
		try {
			setWrapping(true);
			const writeHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].wFPS,
				chainId: chainId,
				abi: FPSWrapperABI,
				functionName: "depositFor",
				args: [account, amount],
			});
			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount) + " FPS" },
				{ title: "Receive: ", value: formatBigInt(amount) + " WFPS" },
				{ title: "Transaction: ", hash: writeHash },
			];
			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: writeHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Wrapping FPS`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Wrapped FPS" rows={toastContent} /> },
			});
			track("fps_wrapped", { amount: formatBigInt(amount) });
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setAmount(0n);
			setWrapping(false);
		}
	};
	const handleUnwrapping = async () => {
		try {
			setUnwrapping(true);
			const writeHash = await writeContract(WAGMI_CONFIG, {
				address: ADDRESS[chainId].wFPS,
				chainId: chainId,
				abi: FPSWrapperABI,
				functionName: "withdrawTo",
				args: [account, amount],
			});
			const toastContent = [
				{ title: "Amount:", value: formatBigInt(amount) + " WFPS" },
				{ title: "Receive: ", value: formatBigInt(amount) + " FPS" },
				{ title: "Transaction: ", hash: writeHash },
			];
			await toast.promise(waitForTransactionReceipt(WAGMI_CONFIG, { hash: writeHash, confirmations: 1 }), {
				pending: { render: <TxToast title={`Unwrapping WFPS`} rows={toastContent} /> },
				success: { render: <TxToast title="Successfully Unwrapped WFPS" rows={toastContent} /> },
			});
			track("fps_unwrapped", { amount: formatBigInt(amount) });
		} catch (error) {
			toast.error(renderErrorTxToast(error));
		} finally {
			setAmount(0n);
			setUnwrapping(false);
		}
	};

	const fromBalance = direction ? fpsBalance : wfpsBalance;
	const fromSymbol = direction ? "FPS" : "WFPS";
	const toSymbol = !direction ? "FPS" : "WFPS";

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
				value={amount.toString()}
				readOnly
			/>

			<div className="px-1 text-sm text-text-secondary font-mono min-h-[1.25rem]">
				1 {fromSymbol} = 1 {toSymbol}
			</div>

			<GuardSupportedChain chain={mainnet}>
				{direction ? (
					amount > fpsAllowance ? (
						<AppButton isLoading={isApproving} disabled={amount == 0n || !!error} onClick={() => handleApprove()}>
							Approve
						</AppButton>
					) : (
						<AppButton disabled={amount == 0n || !!error} isLoading={isWrapping} onClick={() => handleWrapping()}>
							Wrap
						</AppButton>
					)
				) : (
					<AppButton isLoading={isUnwrapping} disabled={amount == 0n || !!error} onClick={() => handleUnwrapping()}>
						Unwrap
					</AppButton>
				)}
			</GuardSupportedChain>

			<EquityDualBalanceStats
				rows={[
					{ tokenSymbol: "FPS", balance: fpsBalance, holdingSeconds: fpsHolding, holdingLabel: "Your holding" },
					{ tokenSymbol: "WFPS", balance: wfpsBalance, holdingSeconds: wfpsHolding, holdingLabel: "Pool holding" },
				]}
			/>
		</>
	);
}
