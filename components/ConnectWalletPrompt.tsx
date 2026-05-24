import { useAppKit } from "@reown/appkit/react";
import { Icon } from "@iconify/react";
import AppBox from "./AppBox";
import AppButton from "./AppButton";

interface Props {
	title?: string;
	description?: string;
	umamiEvent?: string;
	className?: string;
}

export default function ConnectWalletPrompt({
	title = "Connect your wallet",
	description = "Connect your wallet to see your data.",
	umamiEvent,
	className,
}: Props) {
	const AppKit = useAppKit();

	return (
		<AppBox className={className ?? "mt-6"}>
			<div className="flex flex-col items-center text-center gap-4 py-6">
				<Icon icon="solar:wallet-linear" className="text-4xl text-text-secondary" />
				<div className="font-display font-semibold tracking-tight text-2xl text-text-primary">{title}</div>
				<div className="text-text-secondary max-w-md">{description}</div>
				<div className="mt-2">
					<AppButton width="w-auto" onClick={() => AppKit.open()} umamiEvent={umamiEvent}>
						Connect Wallet
					</AppButton>
				</div>
			</div>
		</AppBox>
	);
}
