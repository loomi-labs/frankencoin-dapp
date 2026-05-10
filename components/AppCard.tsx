interface Props {
	children?: React.ReactNode;
	className?: string;
}

export default function AppCard({ className, children }: Props) {
	return (
		<section
			className={`bg-card-body-primary rounded-card border border-card-input-border shadow-card dark:shadow-none ${
				className ?? "p-4 flex flex-col gap-y-4"
			}`}
		>
			{children}
		</section>
	);
}
