import Head from "next/head";
import { ReactNode } from "react";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PortfolioDrawer from "./PortfolioDrawer/PortfolioDrawer";
import { PortfolioDrawerProvider, usePortfolioDrawer } from "./PortfolioDrawer/PortfolioDrawerContext";

type LayoutProps = {
	children: NonNullable<ReactNode>;
};

function LayoutInner({ children }: LayoutProps) {
	const { open } = usePortfolioDrawer();
	const router = useRouter();
	const drawerHidden = router.pathname.startsWith("/mypositions");
	const pushOpen = open && !drawerHidden;

	return (
		<div>
			<Head>
				<title>Frankencoin - Home</title>
			</Head>

			<Navbar />

			<div
				className={`h-main pt-20 transition-[padding] duration-200 ease-out ${
					pushOpen ? "md:pr-[360px]" : "md:pr-0"
				}`}
			>
				<main className="block mb-24 mx-auto max-w-6xl space-y-8 px-4 md:px-8 2xl:max-w-7xl min-h-content">{children}</main>
				<Footer />
			</div>

			<PortfolioDrawer />
		</div>
	);
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<PortfolioDrawerProvider>
			<LayoutInner>{children}</LayoutInner>
		</PortfolioDrawerProvider>
	);
};

export default Layout;
