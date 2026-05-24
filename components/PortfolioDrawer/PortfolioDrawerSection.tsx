import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface Props {
	title: string;
	count?: number;
	defaultOpen?: boolean;
	action?: React.ReactNode;
	children: React.ReactNode;
}

export default function PortfolioDrawerSection({ title, count, defaultOpen = true, action, children }: Props) {
	const [open, setOpen] = useState<boolean>(defaultOpen);

	return (
		<section className="bg-card-body-primary rounded-card border border-card-input-border">
			<header className="flex items-center px-3 py-2">
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					className="flex flex-1 items-center gap-2 text-left text-sm font-display font-semibold text-text-primary"
				>
					<FontAwesomeIcon
						icon={faChevronDown}
						className={`h-3 w-3 text-text-secondary transition-transform ${open ? "" : "-rotate-90"}`}
					/>
					<span>{title}</span>
					{typeof count === "number" && (
						<span className="rounded-full bg-card-content-primary px-2 py-0.5 text-xs font-medium text-text-secondary">
							{count}
						</span>
					)}
				</button>
				{action}
			</header>
			{open && <div className="border-t border-card-body-seperator px-3 py-2 flex flex-col gap-2">{children}</div>}
		</section>
	);
}
