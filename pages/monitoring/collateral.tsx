import Head from "next/head";
import CollateralAndPositionsOverview from "@components/PageEcoSystem/CollateralAndPositionsOverview";
import AppTitle from "@components/AppTitle";

export default function PageCollateral() {
	return (
		<div>
			<Head>
				<title>Frankencoin - Collaterals</title>
			</Head>

			<AppTitle hero title="Accepted Collateral Assets" />

			<div className="my-[2rem]">
				<CollateralAndPositionsOverview />
			</div>
		</div>
	);
}
