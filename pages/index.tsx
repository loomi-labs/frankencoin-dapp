import { useRouter } from "next/router";
import { useEffect } from "react";
import { useConnection } from "wagmi";

export default function MainPage() {
	const router = useRouter();
	const { isConnected } = useConnection();

	useEffect(() => {
		router.replace(isConnected ? "/mypositions" : "/mint");
	}, [isConnected, router]);

	return null;
}
