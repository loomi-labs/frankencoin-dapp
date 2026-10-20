import { Dispatch, SetStateAction } from "react";
import { track } from "@hooks";

export interface TabInputInterface {
	tabs?: string[];
	tab?: string;
	setTab?: Dispatch<SetStateAction<string>>;
}

/** Segmented control: the selected option sits on a raised pill inside a muted track. */
export function TabInput({ tabs = [], tab = "", setTab = () => {} }: TabInputInterface) {
	if (tabs.length == 0) return null;

	return (
		<div
			role="tablist"
			className="bg-card-content-primary mb-5 rounded-input p-1 flex flex-row gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
		>
			{tabs.map((ts) => {
				const selected = ts == tab;
				return (
					<button
						key={"key_" + ts}
						type="button"
						role="tab"
						aria-selected={selected}
						onClick={() => {
							if (selected) return;
							track("tab_" + ts.toLowerCase().replace(/\s+/g, "_"));
							setTab(ts);
						}}
						className={`flex-1 flex-shrink-0 whitespace-nowrap px-4 max-md:px-2 py-1.5 text-sm rounded-full transition-colors ${
							selected
								? "bg-card-body-primary text-text-active font-semibold shadow-card dark:shadow-none"
								: "text-text-secondary hover:text-text-primary cursor-pointer"
						}`}
					>
						{ts}
					</button>
				);
			})}
		</div>
	);
}
