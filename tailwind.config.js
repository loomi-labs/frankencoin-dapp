/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./node_modules/flowbite-react/lib/**/*.js"],
	safelist: [
		{
			pattern: /grid-cols-/,
			variants: ["sm", "md", "lg", "xl", "2xl"],
		},
	],
	theme: {
		fontFamily: {
			default: ["Inter", "system-ui", "sans-serif"],
			display: ["Space Grotesk", "system-ui", "sans-serif"],
			mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
		},
		extend: {
			height: {
				main: "calc(100vh)",
			},
			minHeight: {
				content: "calc(100vh - 230px)",
			},
			transitionProperty: {
				height: "height",
			},
			borderRadius: {
				card: "16px",
				step: "14px",
				input: "10px",
			},
			boxShadow: {
				card: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
				toast: "0 12px 32px rgba(30,27,75,0.12)",
			},
			colors: {
				brand: {
					50: "#FAF5FF",
					100: "#F3E8FF",
					200: "#EDE9FE",
					300: "#C4B5FD",
					400: "#A78BFA",
					500: "#8B5CF6",
					600: "#7C3AED",
					700: "#6D28D9",
					800: "#5B21B6",
					900: "#4C1D95",
					950: "#2E1065",
				},
				layout: {
					primary: "var(--layout-primary)",
					secondary: "var(--layout-secondary)",
					footer: "var(--layout-footer)",
				},
				menu: {
					text: "var(--menu-text)",
					textactive: "var(--menu-textactive)",
					active: "var(--menu-active)",
					hover: "var(--menu-hover)",
					back: "var(--menu-back)",
					separator: "var(--menu-separator)",
				},
				card: {
					input: {
						label: "var(--card-input-label)",
						disabled: "var(--card-input-disabled)",
						empty: "var(--card-input-empty)",
						focus: "var(--card-input-focus)",
						error: "var(--card-input-error)",
						border: "var(--card-input-border)",
						hover: "var(--card-input-hover)",
						min: "var(--card-input-min)",
						max: "var(--card-input-max)",
						reset: "var(--card-input-reset)",
					},
					body: {
						primary: "var(--card-body-primary)",
						secondary: "var(--card-body-secondary)",
						seperator: "var(--card-body-seperator)",
					},
					content: {
						primary: "var(--card-content-primary)",
						secondary: "var(--card-content-secondary)",
						highlight: "var(--card-content-highlight)",
					},
				},
				text: {
					header: "var(--text-header)",
					subheader: "var(--text-subheader)",
					active: "var(--text-active)",
					primary: "var(--text-primary)",
					secondary: "var(--text-secondary)",
					warning: "var(--text-warning)",
					success: "var(--text-success)",
				},
				table: {
					header: {
						primary: "var(--table-header-primary)",
						secondary: "var(--table-header-secondary)",
					},
					row: {
						primary: "var(--table-row-primary)",
						secondary: "var(--table-row-secondary)",
						hover: "var(--table-row-hover)",
					},
				},
				button: {
					default: "var(--button-default)",
					hover: "var(--button-hover)",
					disabled: "var(--button-disabled)",
					textdisabled: "var(--button-textdisabled)",
				},
			},
		},
	},
	darkMode: "class",
	plugins: [require("flowbite/plugin")({ charts: true })],
};
