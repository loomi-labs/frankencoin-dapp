import { usePoolStats } from "@hooks";
import { EquityTrade } from "@hooks";
import dynamic from "next/dynamic";
import { ADDRESS } from "@frankencoin/zchf";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/redux.store";
import { formatUnits, parseEther } from "viem";
import AppCard from "@components/AppCard";
import { mainnet } from "viem/chains";
import { formatCurrency } from "@utils";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const TokenLogo = dynamic(() => import("@components/TokenLogo"), { ssr: false });

const Timeframes = ["All", "1Y", "1Q", "1M", "1W"];
const TypeCharts = ["FPS Price", "FPS Supply", "ZCHF Supply"];

interface Props {
	equityTrades: EquityTrade[];
}

export default function EquityFPSDetailsCard({ equityTrades }: Props) {
	const [timeframe, setTimeframe] = useState<string>(Timeframes[1]);
	const [typechart, setTypechart] = useState<string>(TypeCharts[0]);
	const chainId = mainnet.id;
	const poolStats = usePoolStats();
	const logs = useSelector((state: RootState) => state.dashboard.dailyLog.logs);
	const supply = useSelector((state: RootState) => state.ecosystem.frankencoinSupply);

	let startTrades = Date.now();
	if (timeframe == Timeframes[1]) startTrades -= (365 + 1) * 24 * 60 * 60 * 1000;
	else if (timeframe == Timeframes[2]) startTrades -= (90 + 1) * 24 * 60 * 60 * 1000;
	else if (timeframe == Timeframes[3]) startTrades -= (30 + 1) * 24 * 60 * 60 * 1000;
	else if (timeframe == Timeframes[4]) startTrades -= (7 + 1) * 24 * 60 * 60 * 1000;
	else startTrades = 0;

	const matchingLogs = logs.filter((t) => parseInt(t.timestamp) * 1000 >= startTrades);
	const matchingSupply = Object.values(supply).filter((t) => parseInt(String(t.created)) * 1000 >= startTrades);

	const adjustedInflow = BigInt(matchingLogs.at(-1)?.totalInflow || "0") - BigInt(matchingLogs.at(0)?.totalInflow || "0");
	const adjustedOutflow = BigInt(matchingLogs.at(-1)?.totalOutflow || "0") - BigInt(matchingLogs.at(0)?.totalOutflow || "0");
	const netIncome = adjustedInflow - adjustedOutflow;

	const timestampBegin = BigInt(matchingLogs.at(0)?.timestamp || "0") * 1000n;
	const timestampEnd = BigInt(Date.now());
	const timestampDiff = timestampEnd - timestampBegin;
	const oneYearMs = 365n * 24n * 60n * 60n * 1000n;

	const matchingTrades = typechart === TypeCharts[0] ? equityTrades.filter((t) => t.created * 1000 >= startTrades) : [];

	const tradeAnnotations = matchingTrades.map((trade) => ({
		x: trade.created * 1000,
		y: Math.round(parseFloat(formatUnits(trade.price, 16))) / 100,
		marker: { size: 0 },
		label: {
			borderWidth: 0,
			borderRadius: 0,
			offsetY: trade.kind === "Invested" ? 15 : 2,
			text: trade.kind === "Invested" ? "▲" : "▼",
			style: {
				background: "transparent",
				color: trade.kind === "Invested" ? "#22c55e" : "#ef4444",
				fontSize: "10px",
				padding: { top: 0, bottom: 0, left: 0, right: 0 },
			},
		},
	}));

	const equityStart = BigInt(matchingLogs.at(0)?.totalEquity || "0");
	const equityEnd = BigInt(matchingLogs.at(-1)?.totalEquity || "0");
	const equityAvg = (equityStart + equityEnd) / 2n;
	const returnOnEquity = equityAvg > 0n ? (((netIncome * parseEther("1")) / equityAvg) * oneYearMs) / timestampDiff : 0n;

	const marketCap = (poolStats.equitySupply * poolStats.equityPrice) / BigInt(1e18);
	const roePct = formatCurrency(formatUnits(returnOnEquity * 100n, 18));
	const roeLabel = timeframe == "1Y" ? "Return on Equity" : "RoE (annualized)";

	return (
		<AppCard className="p-8 flex flex-col gap-y-6">
			<div className="text-base font-display font-semibold text-text-primary">Pool overview</div>

			<div id="chart-timeline" className="flex flex-col gap-3">
				<MetricPills options={TypeCharts} active={typechart} onChange={setTypechart} />

				<div className="-m-2">
					<ApexChart
						type="area"
						options={{
							theme: { monochrome: { color: "#2F4356", enabled: true } },
							chart: {
								type: "area",
								height: 300,
								dropShadow: { enabled: false },
								toolbar: { show: false },
								zoom: { enabled: false },
								background: "0",
							},
							stroke: { width: 3 },
							dataLabels: { enabled: false },
							grid: { show: false },
							xaxis: {
								type: "datetime",
								labels: {
									show: false,
									formatter: (value) => {
										const date = new Date(value);
										const d = date.getDate();
										const m = date.getMonth() + 1;
										const y = date.getFullYear();
										return `${d}.${m}.${y}`;
									},
								},
								axisBorder: { show: false },
								axisTicks: { show: false },
							},
							yaxis: {
								min: 0,
								labels: {
									show: true,
									formatter: (value) => {
										if (typechart == TypeCharts[2]) {
											return `${Math.round(value / 100000) / 10} Mio`;
										} else {
											return value.toString();
										}
									},
								},
								axisBorder: { show: true },
								axisTicks: { show: true },
							},
							fill: {
								type: "gradient",
								gradient: {
									shadeIntensity: 0,
									opacityTo: 0.2,
									gradientToColors: ["#2F4356"],
								},
							},
							annotations: { points: tradeAnnotations },
						}}
						series={[
							{
								name: typechart,
								data:
									typechart == TypeCharts[2]
										? matchingSupply.map((entry) => [parseFloat(String(entry.created)) * 1000, entry.supply])
										: matchingLogs.map((entry) => {
												if (typechart == TypeCharts[1]) {
													return [
														parseFloat(entry.timestamp) * 1000,
														Math.round(parseFloat(formatUnits(entry.fpsTotalSupply, 16))) / 100,
													];
												} else {
													return [
														parseFloat(entry.timestamp) * 1000,
														Math.round(parseFloat(formatUnits(entry.fpsPrice, 16))) / 100,
													];
												}
										  }),
							},
						]}
					/>
				</div>

				{matchingLogs.length == 0 ? (
					<div className="flex justify-center text-text-warning text-sm">No data available for selected timeframe.</div>
				) : null}

				<MetricPills options={Timeframes} active={timeframe} onChange={setTimeframe} dense />
			</div>

			<section className="flex flex-col gap-3">
				<SectionLabel>Pool</SectionLabel>
				<Row label="FPS Price" amount={formatCurrency(formatUnits(poolStats.equityPrice, 18))} unit="ZCHF" token="ZCHF" />
				<Row label="Total Supply" amount={formatCurrency(formatUnits(poolStats.equitySupply, 18))} unit="FPS" token="FPS" muted />
				<Row label="Market Cap" amount={formatCurrency(formatUnits(marketCap, 18))} unit="ZCHF" token="ZCHF" muted />
				<Row label="Equity Capital" amount={formatCurrency(formatUnits(poolStats.frankenEquity, 18))} unit="ZCHF" token="ZCHF" muted />
			</section>

			<div className="border-t border-card-input-border border-dashed" />

			<section className="flex flex-col gap-3">
				<SectionLabel>Performance ({timeframe})</SectionLabel>
				<Row label="Net Income" amount={formatCurrency(formatUnits(netIncome, 18))} unit="ZCHF" token="ZCHF" />
				<Row label={roeLabel} amount={roePct} unit="%" />
			</section>
		</AppCard>
	);
}

function MetricPills({
	options,
	active,
	onChange,
	dense,
}: {
	options: string[];
	active: string;
	onChange: (v: string) => void;
	dense?: boolean;
}) {
	return (
		<div className="inline-flex items-center rounded-full border border-card-input-border bg-card-content-primary p-1 self-start">
			{options.map((o) => {
				const isActive = o === active;
				return (
					<button
						key={o}
						type="button"
						onClick={() => onChange(o)}
						className={`rounded-full transition-colors ${dense ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"} ${
							isActive
								? "bg-accent-500 text-white shadow-sm font-medium"
								: "text-text-secondary hover:text-text-primary hover:bg-menu-hover"
						}`}
					>
						{o}
					</button>
				);
			})}
		</div>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return <div className="text-[11px] uppercase tracking-[0.12em] text-text-header">{children}</div>;
}

function Row({
	label,
	amount,
	unit,
	token,
	muted,
}: {
	label: string;
	amount: string | null | undefined;
	unit: string;
	token?: string;
	muted?: boolean;
}) {
	const color = muted ? "text-text-secondary" : "text-text-primary";
	return (
		<div className="flex items-baseline gap-3">
			<div className={`flex-1 ${color}`}>{label}</div>
			<div className={`flex items-center gap-1.5 font-mono ${color}`}>
				<span>{amount}</span>
				{token && <TokenLogo currency={token} size={4} />}
				<span className={token ? "w-[4ch] text-left" : ""}>{unit}</span>
			</div>
		</div>
	);
}
