import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@hooks";

export default function ThemeToggle() {
	const [mode, setMode] = useTheme();

	const toggle = () => setMode(mode === "dark" ? "light" : "dark");

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
			className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:bg-menu-hover hover:text-text-primary transition-colors"
		>
			<FontAwesomeIcon icon={mode === "dark" ? faSun : faMoon} className="w-4 h-4" />
		</button>
	);
}
