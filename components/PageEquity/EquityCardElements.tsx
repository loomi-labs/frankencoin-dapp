import dynamic from "next/dynamic";
import { useRef } from "react";
import { formatUnits } from "viem";
import { BigNumberInput } from "@components/Input/BigNumberInput";
import { formatCurrency, formatDuration } from "@utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightArrowLeft, faCheck, faLock } from "@fortawesome/free-solid-svg-icons";

const TokenLogo = dynamic(() => import("@components/TokenLogo"), { ssr: false });

const LOCK_TOTAL_SECONDS = 86_400n * 90n;

/* -------------------------------------------------------------------------- */
/* Token pill row                                                              */
/* -------------------------------------------------------------------------- */

export function TokenPills({
	tokens,
	active,
	onChange,
}: {
	tokens: readonly string[];
	active: string;
	onChange: (t: string) => void;
}) {
	return (
		<div className="inline-flex items-center rounded-full border border-card-input-border bg-card-content-primary p-1">
			{tokens.map((t) => {
				const isActive = t === active;
				return (
					<button
						key={t}
						type="button"
						onClick={() => onChange(t)}
						className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
							isActive
								? "bg-accent-500 text-white shadow-sm"
								: "text-text-secondary hover:text-text-primary hover:bg-menu-hover"
						}`}
					>
						<TokenLogo currency={t} size={5} />
						<span className="font-medium">{t}</span>
					</button>
				);
			})}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Flat amount input (label + pills + amount + balance row + error)            */
/* -------------------------------------------------------------------------- */

interface FlatAmountInputProps {
	label: string;
	tokens: readonly string[];
	activeToken: string;
	onTokenChange: (t: string) => void;
	value: string;
	onChange?: (value: string) => void;
	onMax?: () => void;
	max?: bigint;
	balance?: bigint;
	error?: string;
	readOnly?: boolean;
	placeholder?: string;
}

const TWO_DIGIT_FORMAT = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	useGrouping: false,
});

export function EquityFlatAmountInput({
	label,
	tokens,
	activeToken,
	onTokenChange,
	value,
	onChange = () => {},
	onMax,
	max,
	balance,
	error,
	readOnly,
	placeholder,
}: FlatAmountInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const readOnlyDisplay = (() => {
		try {
			const num = parseFloat(formatUnits(BigInt(value || "0"), 18));
			return isFinite(num) ? TWO_DIGIT_FORMAT.format(num) : "0.00";
		} catch {
			return "0.00";
		}
	})();
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3 text-card-input-label">
				<span>{label}</span>
				<TokenPills tokens={tokens} active={activeToken} onChange={onTokenChange} />
			</div>

			<div className={`border-b pb-3 ${error ? "border-card-input-error" : "border-card-input-border"}`}>
				{readOnly ? (
					<div className="text-3xl font-mono text-text-secondary">{readOnlyDisplay}</div>
				) : (
					<BigNumberInput
						inputRefChild={inputRef}
						className={`w-full px-0 py-0 text-3xl font-mono bg-transparent ${
							error ? "text-card-input-error" : "text-text-primary"
						}`}
						decimals={18}
						placeholder={placeholder ?? `${activeToken} amount`}
						value={value || ""}
						onChange={onChange}
						formatOnBlur
					/>
				)}
			</div>

			{balance !== undefined && (
				<div className="flex flex-row gap-2 text-sm">
					<div className="flex-1 flex gap-2 min-w-0">
						<span className="text-text-secondary flex-shrink-0">Balance</span>
						<span className="text-text-primary font-mono truncate">
							{formatCurrency(formatUnits(balance, 18))}{" "}
							<span className="text-text-secondary">{activeToken}</span>
						</span>
					</div>
					{!readOnly && max !== undefined && max !== BigInt(value || "0") && (
						<button
							type="button"
							onClick={() => {
								onChange(max.toString());
								onMax?.();
							}}
							className="text-card-input-max hover:text-card-input-focus font-semibold"
						>
							Max
						</button>
					)}
				</div>
			)}

			{error && <div className="text-text-warning text-sm">{error}</div>}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Wide swap pill                                                              */
/* -------------------------------------------------------------------------- */

export function EquityWideSwapPill({
	fromSymbol,
	toSymbol,
	onClick,
	disabled,
}: {
	fromSymbol: string;
	toSymbol: string;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`group mx-auto flex items-center gap-3 rounded-full border bg-card-content-primary px-5 py-2 text-sm transition-colors ${
				disabled
					? "border-card-input-border text-text-secondary cursor-not-allowed opacity-60"
					: "border-card-input-border text-text-secondary hover:border-card-input-hover hover:text-text-primary"
			}`}
		>
			<span className="flex items-center gap-1.5">
				<TokenLogo currency={fromSymbol} size={4} />
				<span className="font-medium text-text-primary">{fromSymbol}</span>
			</span>
			<FontAwesomeIcon
				icon={faArrowRightArrowLeft}
				className={`w-3 h-3 transition-transform ${disabled ? "" : "group-hover:rotate-180"}`}
			/>
			<span className="flex items-center gap-1.5">
				<TokenLogo currency={toSymbol} size={4} />
				<span className="font-medium text-text-primary">{toSymbol}</span>
			</span>
		</button>
	);
}

/* -------------------------------------------------------------------------- */
/* Hero position stats — single token + value + lock progress                  */
/* -------------------------------------------------------------------------- */

interface HeroStatsProps {
	tokenSymbol: string;
	balance: bigint;
	value: bigint;
	valueSymbol: string;
	holdingSeconds: bigint;
	redeemLeftSeconds: bigint;
	ready: boolean;
	lockTotalSeconds?: bigint;
}

export function EquityHeroPositionStats({
	tokenSymbol,
	balance,
	value,
	valueSymbol,
	holdingSeconds,
	redeemLeftSeconds,
	ready,
	lockTotalSeconds = LOCK_TOTAL_SECONDS,
}: HeroStatsProps) {
	const holdingNum = Number(holdingSeconds);
	const validHolding = holdingNum > 0 && holdingNum < 86_400 * 365 * 10;
	const totalNum = Number(lockTotalSeconds);
	const pct = !validHolding ? 0 : ready ? 100 : Math.min(100, Math.round((holdingNum / totalNum) * 100));

	const hasBalance = balance > 0n;

	return (
		<div className="mt-auto rounded-card border border-card-input-border bg-card-content-primary overflow-hidden">
			<div className="flex items-center gap-4 px-6 py-5">
				<TokenLogo currency={tokenSymbol} size={10} />
				<div className="flex-1 min-w-0">
					<div className="text-[11px] uppercase tracking-[0.12em] text-text-header">Your Position</div>
					<div className="flex items-baseline gap-2 mt-0.5">
						<span className="font-display font-semibold text-3xl tracking-tight text-text-primary font-mono">
							{formatCurrency(formatUnits(balance, 18), 2, 2)}
						</span>
						<span className="text-sm text-text-secondary font-mono">{tokenSymbol}</span>
					</div>
					<div className="mt-0.5 text-sm font-mono text-text-secondary">
						≈ {formatCurrency(formatUnits(value, 18), 2, 2)} <span className="opacity-70">{valueSymbol}</span>
					</div>
				</div>
			</div>

			<div className="px-6 py-4 border-t border-card-input-border">
				<div className="flex items-center justify-between gap-3 mb-2">
					<div className="text-[11px] uppercase tracking-[0.12em] text-text-header">Redemption lock</div>
					{!hasBalance ? (
						<span className="text-[11px] text-text-secondary">No position</span>
					) : ready ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 text-[11px] font-semibold">
							<FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
							Ready
						</span>
					) : (
						<span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 text-[11px] font-semibold">
							<FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" />
							{formatDuration(redeemLeftSeconds)} left
						</span>
					)}
				</div>
				<div className="h-1.5 w-full rounded-full bg-card-input-border overflow-hidden">
					<div
						className={`h-full rounded-full transition-all ${ready ? "bg-green-500" : "bg-accent-500"}`}
						style={{ width: `${pct}%` }}
					/>
				</div>
				<div className="mt-1.5 flex justify-between text-[11px] font-mono text-text-secondary">
					<span>{validHolding ? `Held ${formatDuration(holdingSeconds)}` : "Held —"}</span>
					<span>Unlocks at 90d</span>
				</div>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Dual balance stats — for the FPS ↔ WFPS wrap/unwrap flow                    */
/* -------------------------------------------------------------------------- */

export function EquityDualBalanceStats({
	rows,
}: {
	rows: { tokenSymbol: string; balance: bigint; holdingSeconds: bigint; holdingLabel?: string }[];
}) {
	return (
		<div className="mt-auto rounded-card border border-card-input-border bg-card-content-primary overflow-hidden">
			{rows.map((r, i) => {
				const holdingNum = Number(r.holdingSeconds);
				const valid = holdingNum > 0 && holdingNum < 86_400 * 365 * 10;
				return (
					<div
						key={r.tokenSymbol}
						className={`flex items-center gap-4 px-6 py-4 ${i < rows.length - 1 ? "border-b border-card-input-border" : ""}`}
					>
						<TokenLogo currency={r.tokenSymbol} size={8} />
						<div className="flex-1 min-w-0">
							<div className="text-[11px] uppercase tracking-[0.12em] text-text-header">{r.tokenSymbol} balance</div>
							<div className="flex items-baseline gap-1.5 mt-0.5">
								<span className="font-mono text-text-primary">{formatCurrency(formatUnits(r.balance, 18), 2, 2)}</span>
								<span className="text-xs font-mono text-text-secondary">{r.tokenSymbol}</span>
							</div>
						</div>
						<div className="text-right">
							<div className="text-[11px] uppercase tracking-[0.12em] text-text-header">
								{r.holdingLabel ?? "Held"}
							</div>
							<div className="text-sm font-mono text-text-primary">
								{valid ? formatDuration(r.holdingSeconds) : "—"}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
