interface Props {
	children: React.ReactElement[];
}

export default function Table({ children }: Props) {
	return (
		<section>
			<div className="rounded-card overflow-hidden border border-card-input-border bg-card-body-primary shadow-card dark:shadow-none">
				{children}
			</div>
		</section>
	);
}
