import AppCard from "@components/AppCard";
import { ContractUrl, formatCurrency, getChain } from "@utils";
import { Address, formatUnits, zeroAddress } from "viem";
import SavingsActionRedeem from "./SavingsActionRedeem";
import AppLink from "@components/AppLink";
import { SupportedChain } from "@frankencoin/zchf";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/redux.store";
import { SavingsBalance, SavingsBalanceChainIdMapping } from "@frankencoin/api";

interface Props {
	account: Address;
	chain: SupportedChain;
	balance: bigint;
	change: bigint;
	direction: boolean;
	interest: bigint;
	locktime: bigint;
	referrer: Address;
	referralFeePPM: bigint;
	referralFees: bigint;
}

export default function SavingsDetailsCard({
	account,
	chain,
	balance,
	change,
	direction,
	interest,
	locktime,
	referrer,
	referralFeePPM,
	referralFees,
}: Props) {
	const { savingsBalance } = useSelector((state: RootState) => state.savings);

	let entries: SavingsBalance[] = [];

	if (account != zeroAddress) {
		entries = Object.values(savingsBalance)
			.map((m) => Object.values(m))
			.flat()
			.filter((m) => BigInt(m.balance) > 0n);
	}

	const activeBalance = entries.filter((i) => i.chainId == chain.id);
	const inactiveBalance = entries.filter((i) => i.chainId != chain.id);
	const totalBalance = entries.reduce((a, b) => a + BigInt(b.balance), 0n);

	const hasChange = interest > 0n || change !== 0n;
	const resulting = balance + change + interest;

	return (
		<AppCard>
			<div className="text-base font-display font-semibold text-text-primary">Outcome</div>

			<section className="flex flex-col gap-2">
				<SectionLabel>Position</SectionLabel>
				<Row label="Your total balance" value={`${formatCurrency(formatUnits(totalBalance, 18))} ZCHF`} muted />
				{inactiveBalance.map((i, idx) => (
					<SavingsSavedItem savings={i} key={`SavingsSavedItem_${idx}`} />
				))}
				<Row label="Your current balance" value={`${formatCurrency(formatUnits(balance, 18))} ZCHF`} />
			</section>

			{hasChange && (
				<section className="flex flex-col gap-2">
					<SectionLabel>This adjustment</SectionLabel>
					<Row label="Interest to be collected" value={`${formatCurrency(formatUnits(interest, 18))} ZCHF`} />
					<Row
						label={direction ? "To be added from your wallet" : "Withdrawn to your wallet"}
						value={`${change < 0n ? "- " : ""}${formatCurrency(
							formatUnits((change < 0n ? -change : change) - (referrer != zeroAddress ? referralFees : 0n), 18)
						)} ZCHF`}
					/>
					{referrer != zeroAddress && (
						<Row
							label={
								<>
									Pay out to{" "}
									<AppLink className="pr-2" label="referrer" href={ContractUrl(referrer, chain)} external={true} />(
									{Math.round(Number(referralFeePPM / 1000n)) / 10}%)
								</>
							}
							value={`- ${formatCurrency(formatUnits(referralFees, 18))} ZCHF`}
						/>
					)}
				</section>
			)}

			<div className="border-t border-card-input-border border-dashed" />

			<div className="flex font-display font-semibold text-text-primary">
				<div className="flex-1">Resulting balance</div>
				<div className="font-mono">{formatCurrency(formatUnits(resulting, 18))} ZCHF</div>
			</div>

			{locktime > 0 && (
				<div className="text-text-secondary text-sm leading-relaxed">
					Interest starts to continuously accrue after three days, in your case in{" "}
					{formatCurrency((parseFloat(locktime.toString()) / 60 / 60).toString())} hours.
				</div>
			)}

			<div className="flex justify-end">
				<SavingsActionRedeem />
			</div>
		</AppCard>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return <div className="text-[11px] uppercase tracking-[0.12em] text-text-header">{children}</div>;
}

interface RowProps {
	label: React.ReactNode;
	value: React.ReactNode;
	muted?: boolean;
}

function Row({ label, value, muted }: RowProps) {
	return (
		<div className="flex items-baseline gap-3">
			<div className={`flex-1 ${muted ? "text-text-secondary" : "text-text-primary"}`}>{label}</div>
			<div className={`font-mono ${muted ? "text-text-secondary" : "text-text-primary"}`}>{value}</div>
		</div>
	);
}

interface SavingsSavedItemProps {
	savings: SavingsBalance;
}

function SavingsSavedItem({ savings }: SavingsSavedItemProps) {
	return (
		<div className="flex items-baseline gap-3 pl-3">
			<div className="flex-1 text-text-secondary text-sm">on {getChain(savings.chainId).name}</div>
			<div className="text-text-secondary font-mono text-sm">
				{formatCurrency(formatUnits(BigInt(savings.balance), 18))} ZCHF
			</div>
		</div>
	);
}
