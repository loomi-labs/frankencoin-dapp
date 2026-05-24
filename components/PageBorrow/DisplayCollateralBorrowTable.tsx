import dynamic from "next/dynamic";
import { useContractUrl } from "../../hooks/useContractUrl";
import { zeroAddress } from "viem";
import Link from "next/link";
import { formatCurrency } from "@utils";

const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

interface Props {
	symbol: string;
	symbolTiny?: string;
	name: string;
	address: string;
	className?: string;
	balance?: number;
	price: number;
	hideMyWallet?: boolean;
}

export default function DisplayCollateralBorrowTable({
	symbol,
	symbolTiny = "",
	name,
	address,
	className,
	balance,
	price,
	hideMyWallet,
}: Props) {
	const url = useContractUrl(address || zeroAddress);

	const openExplorer = (e: any) => {
		e.preventDefault();
		window.open(url, "_blank");
	};

	return (
		<div className={`flex items-center gap-5 ${className ?? ""}`}>
			<div className="relative flex-shrink-0">
				<TokenLogo currency={symbol} size={9} />
				<div className="absolute inset-0 rounded-full ring-1 ring-card-input-border pointer-events-none" />
			</div>

			<div className="flex flex-col min-w-0">
				<span className="font-display font-semibold text-[15px] tracking-tight text-text-primary text-left truncate">
					{name}
					{symbolTiny ? <span className="text-xs font-normal text-text-secondary"> {symbolTiny}</span> : null}
				</span>
				<span className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
					<span className="font-mono uppercase tracking-wider">{symbol}</span>
					{!hideMyWallet && (
						<>
							<span className="w-[2px] h-[2px] rounded-full bg-menu-separator" aria-hidden />
							<span className="truncate">
								{formatCurrency(balance ?? 0, 2, 2)} in wallet
							</span>
						</>
					)}
				</span>
			</div>
		</div>
	);
}
