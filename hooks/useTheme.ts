import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

export function useTheme(): [ThemeMode, (next: ThemeMode) => void] {
	const [mode, setMode] = useState<ThemeMode>("light");

	useEffect(() => {
		const read = (): ThemeMode => (document.documentElement.classList.contains("dark") ? "dark" : "light");
		setMode(read());
		const observer = new MutationObserver(() => setMode(read()));
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, []);

	const setTheme = (next: ThemeMode) => {
		const root = document.documentElement;
		if (next === "dark") {
			root.classList.add("dark");
			root.setAttribute("data-theme", "dark");
		} else {
			root.classList.remove("dark");
			root.setAttribute("data-theme", "light");
		}
		try {
			localStorage.setItem("theme", next);
		} catch {
			// ignore storage failures (private mode etc)
		}
	};

	return [mode, setTheme];
}
