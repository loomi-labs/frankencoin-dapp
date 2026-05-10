import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

type Mode = "light" | "dark";

export default function ThemeToggle() {
	const [mode, setMode] = useState<Mode>("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
		setMounted(true);
	}, []);

	const toggle = () => {
		const next: Mode = mode === "dark" ? "light" : "dark";
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
		} catch (e) {
			// ignore storage failures (private mode etc)
		}
		setMode(next);
	};

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={mounted ? `Switch to ${mode === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
			className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:bg-menu-hover hover:text-text-primary transition-colors"
		>
			<FontAwesomeIcon icon={mode === "dark" ? faSun : faMoon} className="w-4 h-4" />
		</button>
	);
}
