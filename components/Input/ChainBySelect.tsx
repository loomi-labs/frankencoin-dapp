import ChainLogo from "@components/ChainLogo";
import TokenLogo from "@components/TokenLogo";
import { formatCurrency } from "@utils";
import Select, { components } from "react-select";
import { formatUnits } from "viem";

export type ChainBalances = Record<string, { saved?: bigint; wallet?: bigint }>;

type OptionEntry = {
	value: string;
	label: string;
	reverse: boolean;
};

interface ChainBySelectProps {
	chains: string[];
	chain: string;
	reverse?: boolean;
	chainOnChange?: Function;
	disabled?: boolean;
	invertColors?: boolean;
	prefixLabel?: string;
	tokenLogo?: string;
	isClearable?: boolean;
	balances?: ChainBalances;
	balanceSymbol?: string;
}

export default function ChainBySelect({
	chains,
	chain,
	reverse = false,
	chainOnChange,
	disabled = false,
	invertColors = false,
	prefixLabel,
	tokenLogo,
	isClearable = false,
	balances,
	balanceSymbol = "ZCHF",
}: ChainBySelectProps) {
	const options = chains.map((o): OptionEntry => {
		return { value: o, label: o, reverse };
	});
	const symbolIdx = chains.findIndex((o) => o === chain);
	const active = symbolIdx >= 0 ? options[symbolIdx] : null;

	const handleOnChange = (value: OptionEntry | null) => {
		if (typeof chainOnChange == "function") chainOnChange(value?.value ?? null);
	};

	return (
		<div className="flex items-center rounded-lg px-2 max-md:py-2">
			<Select
				className="-mr-3 md:w-[12rem] max-md:w-full"
				options={options}
				defaultValue={active}
				value={active}
				onChange={handleOnChange}
				isClearable={isClearable}
				styles={{
					indicatorSeparator: () => ({ display: "none" }),
					dropdownIndicator: (base) => ({ ...base, color: "var(--text-secondary)" }),
					clearIndicator: (base) => ({
						...base,
						color: "var(--text-secondary)",
						":hover": { color: "var(--text-primary)" },
					}),
					control: (base, state) => ({
						...base,
						backgroundColor: invertColors ? "var(--card-body-primary)" : "var(--card-content-primary)",
						borderColor: state.isFocused ? "var(--card-input-focus)" : "var(--card-input-border)",
						borderWidth: "1px",
						borderRadius: "0.625rem",
						boxShadow: "none",
						minHeight: "2.5rem",
						":hover": { borderColor: "var(--card-input-hover)" },
					}),
					option: (base, state) => ({
						...base,
						backgroundColor: state.data.value == chain
							? "var(--menu-active)"
							: state.isFocused
							? "var(--menu-hover)"
							: "transparent",
						color: "var(--text-primary)",
						cursor: "pointer",
					}),
					singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
					placeholder: (base) => ({ ...base, color: "var(--card-input-empty)" }),
					input: (base) => ({ ...base, color: "var(--text-primary)" }),
					menu: (base) => ({
						...base,
						backgroundColor: "var(--card-body-primary)",
						border: "1px solid var(--card-input-border)",
						borderRadius: "0.75rem",
						overflow: "hidden",
						boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
						minWidth: balances ? "18rem" : undefined,
						right: balances ? 0 : undefined,
					}),
				}}
				components={{
					Option: ({ children, ...props }) => {
						const key = props.data.label.toLowerCase();
						const entry = balances?.[key];
						const hasSaved = entry?.saved !== undefined && entry.saved > 0n;
						const hasWallet = entry?.wallet !== undefined && entry.wallet > 0n;
						return (
							<components.Option {...props}>
								<div className="flex items-center gap-3">
									<ChainLogo chain={key} size={4} />
									<div className="flex-1 min-w-0">{props.data.label}</div>
									{(hasSaved || hasWallet) && (
										<div className="text-right text-xs text-text-secondary font-mono leading-tight">
											{hasSaved && (
												<div>
													<span className="opacity-70 mr-1">Saved</span>
													{formatCurrency(formatUnits(entry!.saved ?? 0n, 18))} {balanceSymbol}
												</div>
											)}
											{hasWallet && (
												<div>
													<span className="opacity-70 mr-1">Wallet</span>
													{formatCurrency(formatUnits(entry!.wallet ?? 0n, 18))} {balanceSymbol}
												</div>
											)}
										</div>
									)}
								</div>
							</components.Option>
						);
					},
					SingleValue: ({ children, ...props }) => (
						<components.SingleValue {...props}>
							<div className="flex flex-row items-center gap-2">
								{tokenLogo ? (
									<TokenLogo currency={tokenLogo} chain={props.data.label} size={5} />
								) : (
									<ChainLogo chain={props.data.label.toLowerCase()} size={5} />
								)}
								<div className={`truncate w-[6rem]`}>{`${prefixLabel ? prefixLabel + " " : ""}${props.data.label}`}</div>
							</div>
						</components.SingleValue>
					),
				}}
			/>
		</div>
	);
}
