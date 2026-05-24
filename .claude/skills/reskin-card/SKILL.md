---
name: reskin-card
description: Convert a generic or upstream-style details/summary card to the fork's sectioned-row look — `SectionLabel` headings, `Row` data lines with mono values and inline `TokenLogo`, dashed dividers between sections, and a `MetricPills` toggle for chart-or-tab switchers. Use when the user says "redesign this card", "reskin this card", or after pulling an upstream `*Card.tsx` into the fork.
---

## Context

The fork redesigned every details/summary card on `/equity`, `/savings`, and `/mypositions` to a single layout: short uppercase section labels over a list of label/value rows, with dashed horizontal dividers between logical sections. Chart cards and rows with multiple modes use a small pill group (navy active state, transparent inactive). Upstream cards typically arrive as ad-hoc tables of `<div>`s with inline padding and bold values — they need to be rewritten on top of the conventions below.

The shared primitives `SectionLabel`, `Row`, and `MetricPills` are **not yet extracted** into their own files. Each card re-declares them inline at the bottom of the file. Mirror that — don't try to extract a shared component as part of a reskin.

## When to use

- An upstream PR introduces a new details / summary / chart card under `components/Page<Section>/`.
- The user asks to "redesign", "reskin", "polish", or "section-ify" an existing card.

Do **not** use this skill for input/action cards (e.g. mint forms, savings deposit form, swap form) — those follow a different pattern (`AppForm` + `TokenInput`).

## Reusable primitives — reach for these first

- `AppCard` (`components/AppCard.tsx`) — outer card wrapper. Always pass `className="p-8 flex flex-col gap-y-6"` for the standard section spacing.
- `TokenLogo` (`components/TokenLogo.tsx`) — inline token icon. Use `size={4}` for in-row logos.
- `formatCurrency`, `formatUnits` from `@utils` / `viem` — value formatting.
- `dayjs` — date formatting (already in the codebase).

The inline mini-components you re-declare at the bottom of the card file (verbatim copies, not extracted):

```tsx
function SectionLabel({ children }: { children: React.ReactNode }) {
    return <div className="text-[11px] uppercase tracking-[0.12em] text-text-header">{children}</div>;
}

function Row({
    label,
    amount,
    unit,
    token,
    muted,
}: {
    label: string;
    amount: string | null | undefined;
    unit: string;
    token?: string;
    muted?: boolean;
}) {
    const color = muted ? "text-text-secondary" : "text-text-primary";
    return (
        <div className="flex items-baseline gap-3">
            <div className={`flex-1 ${color}`}>{label}</div>
            <div className={`flex items-center gap-1.5 font-mono ${color}`}>
                <span>{amount}</span>
                {token && <TokenLogo currency={token} size={4} />}
                <span className={token ? "w-[4ch] text-left" : ""}>{unit}</span>
            </div>
        </div>
    );
}

function MetricPills({
    options,
    active,
    onChange,
    dense,
}: {
    options: string[];
    active: string;
    onChange: (v: string) => void;
    dense?: boolean;
}) {
    return (
        <div className="inline-flex items-center rounded-full border border-card-input-border bg-card-content-primary p-1 self-start">
            {options.map((o) => {
                const isActive = o === active;
                return (
                    <button
                        key={o}
                        type="button"
                        onClick={() => onChange(o)}
                        className={`rounded-full transition-colors ${dense ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"} ${
                            isActive
                                ? "bg-accent-500 text-white shadow-sm font-medium"
                                : "text-text-secondary hover:text-text-primary hover:bg-menu-hover"
                        }`}
                    >
                        {o}
                    </button>
                );
            })}
        </div>
    );
}
```

These three are the canonical building blocks. Don't deviate; don't extract.

## The pattern

### 1. Card shell

```tsx
<AppCard className="p-8 flex flex-col gap-y-6">
    <div className="text-base font-display font-semibold text-text-primary">Card title</div>

    {/* Optional chart / mode-switch zone */}
    <div className="flex flex-col gap-3">
        <MetricPills options={MODES} active={mode} onChange={setMode} />
        {/* chart or content for the active mode */}
    </div>

    {/* Repeat for each logical section */}
    <section className="flex flex-col gap-3">
        <SectionLabel>Pool</SectionLabel>
        <Row label="…" amount={…} unit="ZCHF" token="ZCHF" />
        <Row label="…" amount={…} unit="FPS"  token="FPS"  muted />
    </section>

    <div className="border-t border-card-input-border border-dashed" />

    <section className="flex flex-col gap-3">
        <SectionLabel>Performance ({timeframe})</SectionLabel>
        <Row label="Net Income" amount={…} unit="ZCHF" token="ZCHF" />
        <Row label="RoE (annualized)" amount={…} unit="%" />
    </section>
</AppCard>
```

### 2. Row rules

- The **first row in a section** is the "primary" — leave `muted` off so its label/value sit in `text-text-primary`.
- Subsequent rows in the same section can be `muted` to de-emphasize them.
- Always pass `unit` (even for `"%"` or `""`). Always pass `token` when there is a token-denominated value — the logo aligns with the unit because of the `w-[4ch] text-left` reservation.
- Numeric values pass through `formatCurrency(formatUnits(bigint, 18))`. Don't inline `toFixed` / `toLocaleString`.
- Empty / loading state: pass `amount="—"` (em-dash, not hyphen-minus).

### 3. Section divider

Always `<div className="border-t border-card-input-border border-dashed" />` between sections. Solid borders are reserved for the card outer ring and table internal lines.

### 4. Chart title block

If the card is chart-centric, the title `<div>` sits above the `MetricPills` + chart block, and the row-list sections follow below the chart. See `EquityFPSDetailsCard.tsx` for the canonical structure.

### 5. MetricPills

- Use the dense variant (`dense` prop) for timeframe selectors (`All / 1Y / 1Q / 1M / 1W`).
- Use the standard size for type selectors (`FPS Price / FPS Supply / ZCHF Supply`).
- The active background is always `bg-accent-500 text-white` — never brand red.

## Before → after migration checklist

When reskinning an upstream card:

1. ✅ Replace the outer wrapper with `<AppCard className="p-8 flex flex-col gap-y-6">`.
2. ✅ Replace any `<h2>` / `<h3>` title with `<div className="text-base font-display font-semibold text-text-primary">`.
3. ✅ Replace each "label: value" line with `<Row …>` — strip inline padding, fonts, and colors.
4. ✅ Apply `font-mono` only via `Row` — don't put `font-mono` on labels.
5. ✅ Replace section divider `<hr>` / solid border with the dashed divider.
6. ✅ Replace any tab/timeframe `<button>` group with `<MetricPills>`.
7. ✅ Swap any inline `bg-brand-500` active state on toggles to `bg-accent-500`.
8. ✅ Add `<TokenLogo>` to any row whose value is denominated in a known token (ZCHF, FPS, the position's collateral symbol, etc.).
9. ✅ Strip any `border` / `bg-card-*` from inner sections — the outer `AppCard` provides the surface; sections are just `flex flex-col gap-3` groups.

## Gotchas

- **Inline copies, not imports:** do not refactor `SectionLabel` / `Row` / `MetricPills` into a shared module as part of a reskin. The fork keeps them inline per file so each card stays self-contained. A future refactor pass may extract them — that is out of scope for a reskin.
- **`w-[4ch]` unit slot:** when a `Row` mixes some entries with `token` and some without, the unit column will misalign unless every row in that section reserves the slot consistently. Either give every row a `token` or none.
- **Chart colors:** ApexCharts color references in card files use literal `#2F4356` (navy hex) because Apex doesn't read Tailwind. That hex is `accent.500` — keep it in sync if you ever shift the palette.
- **Don't add a "View all" link in the card body.** Cards are summary surfaces; navigation belongs in the page-level layout, not inside the card.
- **Hero stats variant:** when a card needs a single large headline number on top (rather than a chart), use a 2-column grid block like the stats strip used in `BorrowTable.tsx`'s header (`grid grid-cols-2 border-b border-card-input-border` with each cell containing a tiny uppercase label over a `font-display font-semibold text-2xl` value). Don't try to express that with `Row`.

## Reference files

- `components/PageEquity/EquityFPSDetailsCard.tsx` — canonical chart card with `MetricPills`, two row sections, and dashed dividers. Lines 79–192 cover the full pattern.
- `components/PageSavings/SavingsDetailsCard.tsx` — row-only variant of the same pattern.
- `components/PageBorrow/BorrowTable.tsx` (lines ~124–153) — hero-stats variant in a table header, useful as a reference when a card needs a headline-number block instead of `Row` lines.
- `components/AppCard.tsx`, `components/TokenLogo.tsx` — primitives.
