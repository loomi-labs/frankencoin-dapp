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
		<div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-4 ${className ?? ""}`}>
			{steps.map((step, i) => (
				<div
					key={i}
					className="flex flex-col gap-3 bg-card-body-primary rounded-card p-6 border border-card-input-border shadow-card dark:shadow-none"
				>
					<div className="text-text-primary text-3xl leading-none flex items-center h-8">{step.icon}</div>
					<div className="flex flex-col gap-1">
						<span className="font-display font-bold text-lg text-text-active">{step.title}</span>
						<span className="text-sm text-text-secondary leading-relaxed">{step.description}</span>
					</div>
				</div>
			))}
		</div>
	);
}
