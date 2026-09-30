import React from "react";

export type HeroStepState = "done" | "current" | "upcoming";

interface HeroStep {
	icon: React.ReactNode;
	title: string;
	description: string;
	state?: HeroStepState;
}

interface Props {
	steps: HeroStep[];
	className?: string;
	nested?: boolean;
}

const CIRCLE_STYLE: Record<HeroStepState, string> = {
	done: "bg-green-500 text-white",
	current: "bg-amber-500 text-white",
	upcoming: "bg-text-primary text-white",
};

const CARD_STYLE: Record<HeroStepState, string> = {
	done: "border-green-500/40 bg-green-500/5",
	current: "border-amber-500/50 bg-amber-500/5",
	upcoming: "border-card-input-border opacity-70",
};

export default function AppHeroSteps({ steps, className, nested = false }: Props) {
	const cardClass = "flex flex-col gap-3 bg-card-body-primary rounded-card p-6 border shadow-card dark:shadow-none";
	return (
		<div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-4 ${className ?? ""}`}>
			{steps.map((step, i) => {
				const state = step.state ?? "upcoming";
				// A step without any explicit state (e.g. the plain numbered onboarding steps elsewhere)
				// keeps the plain card look — only steps that opt into `state` get a colored badge and tint.
				const cardStyle = step.state ? CARD_STYLE[state] : "border-card-input-border";

				return (
					<div key={i} className={`${cardClass} ${cardStyle}`}>
						{step.state ? (
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${CIRCLE_STYLE[state]}`}
							>
								{step.icon}
							</div>
						) : (
							<div className="text-text-primary text-3xl leading-none flex items-center h-8">{step.icon}</div>
						)}
						<div className="flex flex-col gap-1">
							<span className="font-display font-bold text-lg text-text-active">{step.title}</span>
							<span className="text-sm text-text-secondary leading-relaxed">{step.description}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
