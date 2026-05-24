import Link from "next/link";
import { useRouter } from "next/router";
import { track } from "../hooks/useAnalytics";

interface Props {
	to: string;
	name: string;
	external?: boolean;
}

export default function NavButton({ to, name, external }: Props) {
	const router = useRouter();
	const active = router.pathname.includes(to);
	const umamiEvent = "nav_" + name.toLowerCase().replace(/\s+/g, "_");
	return (
		<Link
			className={`flex max-md:py-[10px] max-md:pl-[16px] max-md:w-[160px] md:w-full hover:text-accent-500 transition-colors ${
				active
					? "font-bold text-accent-500 dark:text-white underline decoration-menu-textactive decoration-2 underline-offset-[6px]"
					: "font-medium text-menu-text"
			}`}
			href={to}
			target={external ? "_blank" : "_self"}
			onClick={() => track(umamiEvent)}
		>
			{name}
		</Link>
	);
}
