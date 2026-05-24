---
name: reskin-table
description: Convert a generic or upstream-style table to the fork's design — shared Table primitives, monospace numerics, action column, pagination, page-size persistence, and accent-tinted filters. Use when the user says "redesign this table", "make this table fit our style", or after pulling an upstream `*Table.tsx` / `*Row.tsx` into the fork.
---

## Context

This fork of `frankencoin-dapp` has a single redesigned table look that is used on `/mint` (BorrowTable), `/equity` (the FPS trades table), `/savings` (activities and yearly tables), and `/mypositions`. Upstream tables typically arrive as plain `<TableHead>` + `<TableRow>` markup with inline padding and no pagination — they need to be rewritten on top of the shared primitives and the design conventions below.

## When to use

- An upstream PR introduces a new table or row component under `components/Page<Section>/`.
- The user asks to "redesign", "reskin", or "polish" an existing table.
- A table you wrote with inline markup needs to be brought in line with the rest of the app.

Do **not** use this skill for the simple `<TableHead>` / `<TableRow>` flow that is fine for non-searchable, non-paginated cases (e.g. small static tables). Reach for `TableHeadSearchable` + `TablePagination` only when the table has >10 rows or needs search/filter.

## Reusable primitives — reach for these first

All under `components/Table/`:

- `Table` (`./index.tsx`) — outer card wrapper. Pass `borderless` when the table sits inside another card or under a stats strip.
- `TableHeadSearchable` (`./TableHeadSearchable.tsx`) — search input, "In my wallet" toggle, asset-category filter, custom-category filter, sort headers, mobile `SortBySelect`. Use this over `TableHead` whenever search or filter is involved.
- `TableBody` — `grid grid-cols-1` body wrapper.
- `TableRowSearchable` (`./TableRowSearchable.tsx`) — handles desktop grid layout, mobile per-row label list, action column slot, and the left hover stripe (`before:w-[2px] md:hover:before:bg-button-default`).
- `TableRowEmpty` — empty-state row.
- `TablePagination` (`./TablePagination.tsx`) — pagination controls + page-size selector. Renders nothing when `totalPages <= 1` and no page-size selector is configured.

Hooks / constants:

- `useLocalStorage` from `@hooks` — page-size persistence.
- Shared storage key: `"frankencoin.pageSize"`. **Reuse the same key across tables** so changing rows-per-page in one place applies everywhere.
- `PAGE_SIZE_OPTIONS = [10, 25, 50, 100]`. Default to `PAGE_SIZE_OPTIONS[0]` when the stored value is missing or invalid.

Filter checkboxes:

- Apply `className="checkbox-filter"` (defined in `styles/globals.css`). Do **not** style checkboxes inline — the `.checkbox-filter` class is the only sanctioned style and uses `accent.500` (navy), not brand red.

## The pattern

### 1. Table wiring (`*Table.tsx`)

```tsx
const PAGE_SIZE_STORAGE_KEY = "frankencoin.pageSize";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function FooTable() {
    const headers = ["Asset", "Value", "Rate", "Maturity"];
    const [tab, setTab] = useState<string>(headers[0]);
    const [reverse, setReverse] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategories, setActiveCategories] = useState<string[]>([]);
    const [inMyWallet, setInMyWallet] = useState(false);
    const [page, setPage] = useState(0);
    const [storedPageSize, setStoredPageSize] = useLocalStorage(PAGE_SIZE_STORAGE_KEY);
    const pageSize = PAGE_SIZE_OPTIONS.includes(storedPageSize as number)
        ? (storedPageSize as number)
        : PAGE_SIZE_OPTIONS[0];

    // ... sort + filter ...

    const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
    const pageSafe = Math.min(page, totalPages - 1);
    const paginatedList = filteredList.slice(pageSafe * pageSize, (pageSafe + 1) * pageSize);

    // Reset to page 0 whenever the result set changes.
    useEffect(() => { setPage(0); }, [tab, reverse, searchQuery, activeCategories, inMyWallet]);

    return (
        <Table borderless>
            {/* Optional stats strip — see add-stats-strip pattern, omit if not needed */}
            <TableHeadSearchable
                headers={headers}
                tab={tab}
                reverse={reverse}
                tabOnChange={handleTabOnChange}
                actionCol
                searchPlaceholder="Search …"
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                /* hideMyWallet={!walletAddress} — only if "in my wallet" applies */
                inMyWallet={inMyWallet}
                onInMyWalletChange={setInMyWallet}
                filterOptions={FILTER_OPTIONS}
                activeFilters={activeCategories}
                onFiltersChange={setActiveCategories}
            />
            <TableBody>
                {paginatedList.length === 0 ? (
                    <TableRowEmpty>No matching entries.</TableRowEmpty>
                ) : (
                    paginatedList.map((row) => <FooRow key={row.id} headers={headers} tab={tab} row={row} />)
                )}
            </TableBody>
            <TablePagination
                currentPage={pageSafe}
                totalPages={totalPages}
                totalItems={filteredList.length}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setStoredPageSize(size); setPage(0); }}
            />
        </Table>
    );
}
```

Sort-toggle handler (always the same):

```tsx
const handleTabOnChange = (e: string) => {
    if (tab === e) setReverse(!reverse);
    else { setReverse(false); setTab(e); }
};
```

### 2. Row markup (`*Row.tsx`)

- Wrap children in `TableRowSearchable` so the desktop grid, mobile per-label list, and action column come for free.
- Each non-first cell is a `flex flex-col items-end` stack: primary value on top, secondary annotation below.
- Numeric values use `font-mono`. Format: `<span className="font-mono">{value}</span><span className="ml-0.5 font-mono text-[11px] text-text-secondary">{unit}</span>`.
- Primary value text size: `text-[15px] text-text-primary`. Secondary annotation: `text-[11px] text-text-secondary` (or `text-[14px] font-medium` for status-like strings, e.g. "Available Soon").
- Action column: text-arrow CTA with hover-expand gap.

Canonical action button:

```tsx
<button
    type="button"
    onClick={handleAction}
    disabled={isPending}
    className={`group inline-flex items-center gap-1.5 px-1 py-2 text-[13px] font-semibold transition-[gap] duration-150 ease-out ${
        isPending
            ? "text-text-secondary cursor-not-allowed"
            : "text-text-active cursor-pointer hover:gap-2.5"
    }`}
>
    {isPending ? "Soon" : ctaLabel}
    {!isPending && (
        <span className="transition-transform duration-150 ease-out group-hover:translate-x-1" aria-hidden>→</span>
    )}
</button>
```

LTV-style segmented bar (when a 0–100% value should be visualized):

```tsx
const ltvBarColor =
    nominalLTV >= 90 ? "bg-text-warning" :
    nominalLTV >= 80 ? "bg-amber-500" :
                       "bg-text-secondary";
<span className="block h-[2px] w-[72px] overflow-hidden rounded-[1px] bg-card-input-border">
    <span className={`block h-full ${ltvBarColor}`} style={{ width: `${Math.max(0, Math.min(100, nominalLTV))}%` }} />
</span>
```

Maturity-style "relative + absolute" date column (using dayjs, already in the codebase):

```tsx
<span className="text-[14px] font-medium text-text-primary capitalize">{expirationRelative}</span>
<span className="mt-0.5 font-mono text-[11px] tracking-[0.02em] text-text-secondary">{expirationAbsolute}</span>
```

Use an em-dash (`<span className="text-text-secondary">—</span>`) for perpetual / not-applicable rows.

### 3. Spacing rules (do not deviate)

- Horizontal padding on every band (search bar, headers, rows, pagination): `px-8 xl:px-10`.
- Vertical padding on rows: `py-4` (already in `TableRowSearchable`).
- Action column width: `md:w-[8rem] md:ml-[2rem]` (already in `TableRowSearchable`).
- Sort headers: `text-[11px] uppercase tracking-[0.12em] font-medium`, color flips between `text-text-header` (inactive) and `text-text-primary` (active).

### 4. Filters

- Pass `filterOptions: FilterOption[]` for the "Asset Categories" group.
- Pass `customCategories` + `customCategoriesTitle` (default `"State"`) for status-like filters (e.g. `["Active", "Closed", "Expired"]`).
- The dropdown auto-hides when both are empty.

## Before → after migration checklist

When converting an upstream table:

1. ✅ Replace any direct `<TableHead>` import with `TableHeadSearchable` if search/filter is needed.
2. ✅ Strip inline `px-*` / `py-*` from the row component — `TableRowSearchable` already supplies them.
3. ✅ Wrap every numeric value in `<span className="font-mono">…</span>` + muted-unit span.
4. ✅ Replace single-cell `<div>` content with `flex flex-col items-end` for any column that has a primary + secondary value.
5. ✅ Replace any "More" or chevron action with the text-arrow CTA above.
6. ✅ Add `useLocalStorage` page-size state + `TablePagination` + `useEffect` page-reset.
7. ✅ Replace any inline checkbox style with `className="checkbox-filter"`.
8. ✅ Replace any `bg-button-default` filter pill tint with the standard navy treatment that `TableHeadSearchable` already applies.
9. ✅ Replace hardcoded date strings with the `dayjs(...).fromNow()` + `dayjs(...).format("DD MMM YYYY")` pattern.

## Gotchas

- **Sort-time missing data:** when sorting by a derived value that depends on an external price map (e.g. LTV = `liqPrice / price`), guard against missing entries — fall back to `1` for the denominator, not `0` (see `BorrowTable.tsx`'s `sortPositions`). A missing price must not throw or sort to NaN.
- **Page-reset coverage:** the `useEffect` reset list **must** include every state value that changes the visible rows (`tab`, `reverse`, search, all filters, "in my wallet"). Missing one causes pages to render blank when the user filters down to fewer items.
- **`pageSafe` clamp:** always render with `pageSafe = Math.min(page, totalPages - 1)`, not raw `page` — the user can land on page 9 then filter the list to one page and you must clamp.
- **Mobile pagination:** the row-size selector hides on mobile (it's inside `hidden md:block`-style wrappers in `TablePagination`); the mobile shows only "Page N / Total". Don't try to override.
- **`Table borderless`:** use `borderless` when stacking a stats strip on top of the table inside the same card. Otherwise omit it so the table gets its standard outer border.
- **Stable React keys:** rows often need a composite key, not just an index — see `key={\`BorrowRow_${pos.position || idx}\`}` in `BorrowTable.tsx`.

## Reference files

- `components/PageBorrow/BorrowTable.tsx` — canonical table wiring (sort, filter, pagination, "in my wallet").
- `components/PageBorrow/BorrowRow.tsx` — canonical row with action button, LTV bar, dual-line maturity.
- `components/Table/TableHeadSearchable.tsx`, `TablePagination.tsx`, `TableRowSearchable.tsx`, `TableRowEmpty.tsx`, `index.tsx` — primitives.
- `styles/globals.css` (lines ~119–133) — `.checkbox-filter` definition.
- `hooks/useLocalStorage.ts` — the persistence hook.
