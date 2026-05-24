import { useAppKit } from "@reown/appkit/react";
import { useConnection } from "wagmi";
import { track } from "@hooks";
import { shortenAddress } from "@utils";

export default function WalletConnect() {
	const AppKit = useAppKit();
	const { address, isConnected } = useConnection();

	if (!isConnected || !address) {
		return (
			<div className="flex items-center gap-4 py-1">
				<button
					type="button"
					className="bg-button-default text-white h-8 md:h-10 flex justify-center cursor-pointer items-center rounded-full px-4 font-semibold hover:bg-button-hover"
					onClick={() => {
						track("wallet_connect_clicked");
						AppKit.open();
					}}
				>
					Connect Wallet
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-4 py-1">
			<button
				type="button"
				className="bg-card-body-secondary text-menu-text border border-menu-separator h-8 md:h-10 flex items-center gap-2 cursor-pointer rounded-full px-3 font-semibold hover:bg-menu-hover"
				onClick={() => AppKit.open({ view: "Account" })}
			>
				<span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
				<span className="font-mono text-sm">{shortenAddress(address)}</span>
			</button>
		</div>
	);
}
