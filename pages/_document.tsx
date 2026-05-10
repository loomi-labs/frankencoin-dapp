import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;if(d){r.classList.add('dark');r.setAttribute('data-theme','dark');}else{r.setAttribute('data-theme','light');}}catch(e){}})();`;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
				/>
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				<Script
					defer
					src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
					data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
					strategy="afterInteractive"
				/>
			</Head>
			<body className="font-default container-xl mx-auto bg-layout-primary text-text-primary font-medium">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
