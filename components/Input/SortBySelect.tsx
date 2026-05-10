import { faArrowDownWideShort, faArrowUpShortWide } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select, { components } from "react-select";

type OptionEntry = {
	value: string;
	label: string;
	reverse: boolean;
};

interface SortBySelectProps {
	headers: string[];
	tab?: string;
	reverse?: boolean;
	tabOnChange?: Function;
}

export default function SortBySelect({ headers, tab, reverse = false, tabOnChange }: SortBySelectProps) {
	const options = headers.map((o): OptionEntry => {
		return { value: o, label: o, reverse };
	});
	const symbolIdx = headers.findIndex((o) => o === tab);
	const active = options[symbolIdx];

	const handleOnChange = (value: OptionEntry | null) => {
		if (value == null) return;
		if (typeof tabOnChange == "function") tabOnChange(value.value);
	};

	return (
		<div className="flex items-center rounded-lg px-4">
			<Select
				className="-mr-3 w-[12rem]"
				options={options}
				defaultValue={active}
				value={active}
				onChange={handleOnChange}
				styles={{
					indicatorSeparator: () => ({ display: "none" }),
					dropdownIndicator: (base) => ({ ...base, color: "var(--text-secondary)" }),
					control: (base, state) => ({
						...base,
						backgroundColor: "var(--card-body-primary)",
						borderColor: state.isFocused ? "var(--card-input-focus)" : "var(--card-input-border)",
						borderWidth: "1px",
						borderRadius: "0.625rem",
						boxShadow: "none",
						minHeight: "2.5rem",
						":hover": { borderColor: "var(--card-input-hover)" },
					}),
					option: (base, state) => ({
						...base,
						backgroundColor: state.data.value == tab
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
					}),
				}}
				components={{
					Option: ({ children, ...props }) => (
						<components.Option {...props}>
							<div className="flex flex-row items-center gap-4">
								{props.data.label == tab && (
									<FontAwesomeIcon
										icon={props.data.reverse ? faArrowUpShortWide : faArrowDownWideShort}
										className="cursor-pointer"
									/>
								)}
								<div className={`${props.data.label == tab ? "" : "pl-[34px]"}`}>{props.data.label}</div>
							</div>
						</components.Option>
					),
					SingleValue: ({ children, ...props }) => (
						<components.SingleValue {...props}>
							<div className="flex flex-row items-center gap-4">
								{props.data.label == tab && (
									<FontAwesomeIcon
										icon={props.data.reverse ? faArrowUpShortWide : faArrowDownWideShort}
										className="cursor-pointer"
									/>
								)}
								<div className={`${props.data.label == tab ? "" : "pl-[43px]"}`}>{props.data.label}</div>
							</div>
						</components.SingleValue>
					),
				}}
			/>
		</div>
	);
}
