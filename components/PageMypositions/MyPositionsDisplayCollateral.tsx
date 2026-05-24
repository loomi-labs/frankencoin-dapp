import { formatCurrency } from "@utils";
import dynamic from "next/dynamic";
import { useContractUrl } from "../../hooks/useContractUrl";
import { formatUnits, zeroAddress } from "viem";
import Link from "next/link";
import { PositionQuery } from "@frankencoin/api";
const TokenLogo = dynamic(() => import("../TokenLogo"), { ssr: false });

interface Props {
	position: PositionQuery;
	collateralPrice: number;
	zchfPrice: number;
	className?: string;
}

export default function MyPositionsDisplayCollateral({ position, collateralPrice, zchfPrice, className }: Props) {
	const url = useContractUrl(position.position || zeroAddress);

	const openExplorer = (e: any) => {
		e.preventDefault();
		window.open(url, "_blank");
	};

	const collateralSize: number = parseFloat(formatUnits(BigInt(position.collateralBalance), position.collateralDecimals));
	const collateralValue: number = (collateralSize * collateralPrice) / zchfPrice;

	return (
		<div className={`flex items-center gap-3 ${className ?? ""}`}>
			<Link href={url} onClick={openExplorer} className="flex-shrink-0">
				<div className="relative">
					<TokenLogo currency={position.collateralSymbol} size={9} />
					<div className="absolute inset-0 rounded-full ring-1 ring-card-input-border pointer-events-none" />
				</div>
			</Link>

			<div className="flex flex-col min-w-0 text-left">
				<span className="text-[15px] text-text-primary truncate">
					<span className="font-mono">{formatCurrency(collateralSize, 2, 2)}</span>
					<span className="ml-1 font-mono text-[11px] text-text-secondary uppercase tracking-wider">
						{position.collateralSymbol}
					</span>
					<span className="ml-1 text-[11px] text-text-secondary">{position.version == 2 ? "v2" : "v1"}</span>
				</span>
				<span className="mt-0.5 font-mono text-[11px] text-text-secondary">
					{formatCurrency(collateralValue, 2, 2)} ZCHF
				</span>
			</div>
		</div>
	);
}
