import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "frankencoin:portfolio-drawer-open";

type PortfolioDrawerContextValue = {
	open: boolean;
	setOpen: (next: boolean) => void;
	toggle: () => void;
};

const PortfolioDrawerContext = createContext<PortfolioDrawerContextValue>({
	open: false,
	setOpen: () => {},
	toggle: () => {},
});

export function PortfolioDrawerProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpenState] = useState<boolean>(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (raw === "true") setOpenState(true);
	}, []);

	const setOpen = (next: boolean) => {
		setOpenState(next);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
		}
	};

	const value = useMemo<PortfolioDrawerContextValue>(
		() => ({ open, setOpen, toggle: () => setOpen(!open) }),
		[open]
	);

	return <PortfolioDrawerContext.Provider value={value}>{children}</PortfolioDrawerContext.Provider>;
}

export function usePortfolioDrawer() {
	return useContext(PortfolioDrawerContext);
}
