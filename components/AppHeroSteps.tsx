import React from "react";

interface HeroStep {
	icon: React.ReactNode;
	title: string;
	description: string;
}

interface Props {
	steps: HeroStep[];
	className?: string;
}

export default function AppHeroSteps({ steps, className }: Props) {
	return (
		<div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-3 ${className ?? ""}`}>
			{steps.map((step, i) => (
				<div
					key={i}
					className="flex items-start gap-4 bg-card-body-primary rounded-step p-5 border border-card-input-border"
				>
					<div className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 flex items-center justify-center text-sm font-display font-semibold">
						{step.icon}
					</div>
					<div className="flex flex-col gap-1">
						<span className="font-display font-semibold text-text-primary">{step.title}</span>
						<span className="text-sm text-text-secondary leading-relaxed">{step.description}</span>
					</div>
				</div>
			))}
		</div>
	);
}
