import { Address, formatUnits } from "viem";
import { usePortfolioTotals } from "@hooks";
import { formatCurrency } from "../../utils/format";
import AppCard from "@components/AppCard";
import AppBox from "@components/AppBox";
import DisplayLabel from "@components/DisplayLabel";
import DisplayAmount from "@components/DisplayAmount";
import { ADDRESS } from "@frankencoin/zchf";
import { mainnet } from "viem/chains";

export default function MyPortfolioTotalsCard({ account }: { account: Address }) {
	const { totalOwed, totalMinted, totalReserves, valueLockedChf } = usePortfolioTotals(account);
	const frankencoin = ADDRESS[mainnet.id].frankencoin;

	return (
		<AppCard>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<AppBox>
					<DisplayLabel label="Owed" />
					<DisplayAmount className="mt-1" amount={totalOwed} currency="ZCHF" address={frankencoin} />
				</AppBox>
				<AppBox>
					<DisplayLabel label="Minted" />
					<DisplayAmount className="mt-1" amount={totalMinted} currency="ZCHF" address={frankencoin} />
				</AppBox>
				<AppBox>
					<DisplayLabel label="Reserves" />
					<DisplayAmount className="mt-1" amount={totalReserves} currency="ZCHF" address={frankencoin} />
				</AppBox>
				<AppBox>
					<DisplayLabel label="Value Locked" />
					<div className="pt-2">
						<div className="flex items-center gap-2">
							<div className="flex-1 text-text-primary font-mono">
								{formatCurrency(valueLockedChf) || "0.00"}
							</div>
							<div className="text-card-input-label">CHF</div>
						</div>
					</div>
				</AppBox>
			</div>
		</AppCard>
	);
}
