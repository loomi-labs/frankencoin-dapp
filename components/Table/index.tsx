interface Props {
	children: React.ReactElement[];
	borderless?: boolean;
}

export default function Table({ children, borderless = false }: Props) {
	return (
		<section>
			<div
				className={`rounded-card overflow-hidden bg-card-body-primary shadow-card dark:shadow-none ${
					borderless ? "" : "border border-card-input-border"
				}`}
			>
				{children}
			</div>
		</section>
	);
}
