interface Props {
	children: React.ReactElement[];
	borderless?: boolean;
}

export default function Table({ children, borderless = false }: Props) {
	return (
		<section>
			<div
				className={`rounded-card overflow-x-clip overflow-y-visible bg-card-body-primary shadow-card dark:shadow-none ${
					borderless ? "" : "border border-card-input-border"
				}`}
			>
				{children}
			</div>
		</section>
	);
}
