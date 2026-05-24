/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./node_modules/flowbite-react/lib/**/*.js"],
	safelist: [
		{
			pattern: /grid-cols-/,
			variants: ["sm", "md", "lg", "xl", "2xl"],
		},
		{ pattern: /^(w|h)-(5|6|8|9|10|12)$/ },
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
				card: "0 1px 3px rgba(141,141,146,0.08), 0 8px 24px rgba(141,141,146,0.10)",
				toast: "0 12px 32px rgba(141,141,146,0.24)",
			},
			colors: {
				brand: {
					50: "#FBD4D2",
					100: "#F3B8B3",
					200: "#ED9A8E",
					300: "#E67D6B",
					400: "#E0584D",
					500: "#DA291C",
					600: "#B62217",
					700: "#921B13",
					800: "#6D150E",
					900: "#490E09",
					950: "#240602",
				},
				secondary: {
					50: "#E8E8E9",
					100: "#D9D9DB",
					200: "#C6C6C9",
					300: "#B3B3B6",
					400: "#A0A0A4",
					500: "#8D8D92",
					600: "#76767A",
					700: "#5E5E61",
					800: "#474749",
					900: "#2F2F31",
					950: "#1C1C1D",
				},
				accent: {
					50: "#D5D9DD",
					100: "#BAC0C7",
					200: "#97A1AB",
					300: "#74828E",
					400: "#526272",
					500: "#2F4356",
					600: "#273848",
					700: "#1F2D39",
					800: "#18222B",
					900: "#10161D",
					950: "#090D11",
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
