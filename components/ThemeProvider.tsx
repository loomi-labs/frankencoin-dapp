import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			if (localStorage.getItem("theme")) return;
			const root = document.documentElement;
			if (e.matches) {
				root.classList.add("dark");
				root.setAttribute("data-theme", "dark");
			} else {
				root.classList.remove("dark");
				root.setAttribute("data-theme", "light");
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return <>{children}</>;
}
