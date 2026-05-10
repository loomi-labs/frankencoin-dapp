import { Dispatch, SetStateAction } from "react";

export interface TabInputInterface {
	tabs?: string[];
	tab?: string;
	setTab?: Dispatch<SetStateAction<string>>;
}

export function TabInput({ tabs = [], tab = "", setTab = () => {} }: TabInputInterface) {
	if (tabs.length == 0) return null;

	return (
		<div className="bg-card-content-primary mb-5 rounded-input p-1 flex flex-row gap-1">
			{tabs.map((ts) => (
				<button
					key={"key_" + ts}
					type="button"
					onClick={() => setTab(ts)}
					className={`flex-1 px-4 max-md:px-2 py-1.5 text-sm rounded-full transition-colors ${
						ts == tab
							? "bg-card-body-primary text-text-active font-semibold shadow-card dark:shadow-none"
							: "text-text-secondary hover:text-text-primary cursor-pointer"
					}`}
				>
					{ts}
				</button>
			))}
		</div>
	);
}
