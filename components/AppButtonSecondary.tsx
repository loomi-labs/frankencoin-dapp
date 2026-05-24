import Link from "next/link";
import LoadingSpin from "./LoadingSpin";
import { track } from "../hooks/useAnalytics";

interface Props {
	to?: string;
	isLoading?: boolean;
	className?: string;
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	width?: string;
	onClick?: (e?: any) => void;
	children?: React.ReactNode;
	error?: string;
	warning?: string;
	note?: string;
	umamiEvent?: string;
}

export default function AppButtonSecondary({
	to,
	isLoading,
	className,
	size = "medium",
	disabled,
	width,
	onClick = () => {},
	children,
	error,
	warning,
	note,
	umamiEvent,
}: Props) {
	const sizeClass =
		size === "small"
			? "px-3 py-1 md:px-4 md:py-1.5 text-sm"
			: size === "medium"
			? "px-4 py-2 md:px-5 md:py-2.5"
			: "py-3";

	const btnClass = `btn ${className ?? ""} ${sizeClass} ${
		disabled || isLoading
			? "cursor-not-allowed bg-button-disabled text-button-textdisabled"
			: "bg-transparent border border-brand-300 dark:border-brand-700 text-text-active hover:bg-brand-50 dark:hover:bg-brand-900/30"
	} ${width ?? "w-full"}`.trim();

	const button = to ? (
		<Link
			href={to}
			className={btnClass}
			onClick={(e) => {
				onClick(e);
				if (umamiEvent) track(umamiEvent);
			}}
		>
			{children}
		</Link>
	) : (
		<button className={btnClass} onClick={(e) => !disabled && !isLoading && onClick(e)} data-umami-event={umamiEvent}>
			{isLoading && <LoadingSpin />}
			{children}
		</button>
	);

	if (!error && !warning && !note) return button;

	return (
		<div>
			{button}
			{error ? (
				<div className="flex my-2 px-3.5 text-text-warning">{error}</div>
			) : warning ? (
				<div className="flex my-2 px-3.5 text-amber-500">{warning}</div>
			) : (
				<div className="flex my-2 px-3.5">{note}</div>
			)}
		</div>
	);
}
