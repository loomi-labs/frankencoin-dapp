import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { useConnection } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Address, zeroAddress } from "viem";
import { store } from "../../redux/redux.store";
import { fetchPositionsList } from "../../redux/slices/positions.slice";
import { fetchChallengesList } from "../../redux/slices/challenges.slice";
import { fetchBidsList } from "../../redux/slices/bids.slice";
import { fetchSavings } from "../../redux/slices/savings.slice";
import { usePortfolioDrawer } from "./PortfolioDrawerContext";
import PortfolioDrawerTotals from "./PortfolioDrawerTotals";
import PortfolioDrawerPositions from "./PortfolioDrawerPositions";
import PortfolioDrawerSavings from "./PortfolioDrawerSavings";
import PortfolioDrawerFps from "./PortfolioDrawerFps";
import PortfolioDrawerWallet from "./PortfolioDrawerWallet";
import PortfolioDrawerActivity from "./PortfolioDrawerActivity";

export default function PortfolioDrawer() {
	const { open, setOpen, toggle } = usePortfolioDrawer();
	const { address, isConnected } = useConnection();
	const AppKit = useAppKit();
	const account: Address = address ?? zeroAddress;

	useEffect(() => {
		store.dispatch(fetchPositionsList());
		store.dispatch(fetchChallengesList());
		store.dispatch(fetchBidsList());
	}, []);

	useEffect(() => {
		if (address) {
			store.dispatch(fetchSavings(address));
		}
	}, [address]);

	return (
		<>
			{/* Edge tab trigger */}
			<button
				type="button"
				onClick={toggle}
				aria-label={open ? "Close portfolio" : "Open portfolio"}
				className={`fixed top-1/2 z-40 -translate-y-1/2 flex items-center gap-2 rounded-l-lg border border-r-0 border-card-input-border bg-card-body-primary px-2 py-3 text-text-primary shadow-card transition-[right] duration-200 hover:bg-menu-hover ${
					open
						? "right-[85vw] md:right-[360px] max-md:hidden"
						: "right-0"
				}`}
			>
				<FontAwesomeIcon icon={open ? faChevronRight : faChevronLeft} className="h-3 w-3" />
				<FontAwesomeIcon icon={faChartPie} className="h-4 w-4" />
				<span
					className="hidden md:inline text-[10px] font-semibold uppercase tracking-wide"
					style={{ writingMode: "vertical-rl" }}
				>
					Portfolio
				</span>
			</button>

			{/* Mobile scrim */}
			{open && (
				<div
					className="fixed inset-0 z-30 bg-black/40 md:hidden"
					onClick={() => setOpen(false)}
					aria-hidden
				/>
			)}

			{/* Drawer panel */}
			<aside
				className={`fixed top-0 right-0 z-30 h-full w-[85vw] md:w-[360px] bg-layout-primary border-l border-card-input-border shadow-card transition-transform duration-200 ease-out ${
					open ? "translate-x-0" : "translate-x-full"
				}`}
				aria-hidden={!open}
			>
				<div className="flex h-full flex-col">
					<header className="flex items-center justify-between px-4 py-3 border-b border-card-input-border">
						<div className="flex items-center gap-2">
							<FontAwesomeIcon icon={faChartPie} className="h-4 w-4 text-text-primary" />
							<span className="font-display font-semibold text-text-primary">My Portfolio</span>
						</div>
						<button
							type="button"
							onClick={() => setOpen(false)}
							aria-label="Close portfolio"
							className="rounded-full p-1 text-text-secondary hover:bg-menu-hover hover:text-text-primary"
						>
							<FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
						</button>
					</header>

					<div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
						{!isConnected || !address ? (
							<div className="rounded-card border border-card-input-border bg-card-body-primary p-4 text-center">
								<div className="text-sm font-medium text-text-primary mb-1">Connect your wallet</div>
								<div className="text-xs text-text-secondary mb-3">
									Sign in to see your positions, savings, FPS, and wallet balances.
								</div>
								<button
									type="button"
									onClick={() => AppKit.open()}
									className="bg-button-default hover:bg-button-hover text-white text-sm font-semibold rounded-full px-4 py-2"
								>
									Connect Wallet
								</button>
							</div>
						) : (
							<>
								<PortfolioDrawerTotals account={account} />
								<PortfolioDrawerPositions account={account} />
								<PortfolioDrawerSavings account={account} />
								<PortfolioDrawerFps />
								<PortfolioDrawerWallet />
								<PortfolioDrawerActivity account={account} />
							</>
						)}
					</div>
				</div>
			</aside>
		</>
	);
}
