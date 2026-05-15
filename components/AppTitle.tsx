import dynamic from "next/dynamic";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const TokenLogo = dynamic(() => import("./TokenLogo"), { ssr: false });

interface BadgeProps {
	label: string;
	className: string;
}

interface Props {
	title?: string;
	symbol?: string;
	icon?: IconDefinition;
	url?: string;
	className?: string;
	classNameTitle?: string;
	badge?: string;
	badgeColor?: string;
	badges?: BadgeProps[];
	subtitle?: string | React.ReactNode;
	actions?: React.ReactNode;
	hero?: boolean;
	children?: React.ReactElement | React.ReactElement[];
}

export default function AppTitle({
	title,
	symbol,
	icon,
	url,
	className,
	classNameTitle,
	badge,
	badgeColor = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
	badges,
	subtitle,
	actions,
	hero,
	children,
}: Props) {
	const hasHeader = symbol || icon || url || title;

	const titleClass = hero
		? `${classNameTitle ?? ""} font-display font-semibold tracking-tight text-3xl md:text-4xl text-text-primary leading-tight`
		: `${classNameTitle ?? ""} font-display font-semibold tracking-tight text-2xl text-text-primary`;

	const subtitleClass = hero
		? "mt-3 text-text-secondary text-base max-w-prose leading-relaxed"
		: "mt-1 text-text-secondary text-sm";

	const headerBlock = (
		<>
			{(hasHeader || actions) && (
				<div className={actions ? "flex flex-col md:flex-row md:items-center justify-between gap-3" : undefined}>
					<div>
						{hasHeader && (
							<div className="flex items-center gap-2 flex-wrap">
								{symbol && <TokenLogo currency={symbol} />}
								{icon && <FontAwesomeIcon icon={icon} className="w-8 h-8" />}
								{url && <Image src={url} width={32} height={32} className="rounded-full" alt="logo" unoptimized />}
								{title && <span className={titleClass}>{title}</span>}
								{badge && <span className={`${badgeColor} text-sm font-medium px-2.5 py-0.5 rounded-lg`}>{badge}</span>}
								{badges?.map((b, i) => (
									<span key={i} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.className}`}>
										{b.label}
									</span>
								))}
							</div>
						)}
						{subtitle && <div className={subtitleClass}>{subtitle}</div>}
					</div>
					{actions && <div>{actions}</div>}
				</div>
			)}
			{children ?? null}
		</>
	);

	if (hero) {
		return (
			<div className={`${className ?? ""} pt-6`}>
				<div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-50 to-[#F5F0FF] dark:from-[#1E1233] dark:to-[#15102A] px-7 py-10 md:px-12 md:py-14">
					<div
						aria-hidden
						className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full"
						style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)" }}
					/>
					<div className="relative">{headerBlock}</div>
				</div>
			</div>
		);
	}

	return <div className={`${className ?? ""} pt-6`}>{headerBlock}</div>;
}
