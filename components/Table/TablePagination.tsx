import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface Props {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	totalItems?: number;
	pageSize?: number;
	pageSizeOptions?: number[];
	onPageSizeChange?: (size: number) => void;
}

export default function TablePagination({
	currentPage,
	totalPages,
	onPageChange,
	totalItems,
	pageSize,
	pageSizeOptions,
	onPageSizeChange,
}: Props) {
	const showPageSize = pageSize !== undefined && pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange !== undefined;

	if (totalPages <= 1 && !showPageSize) return null;

	const items = buildPageItems(currentPage, totalPages);
	const canPrev = currentPage > 0;
	const canNext = currentPage < totalPages - 1;

	const from = pageSize !== undefined ? currentPage * pageSize + 1 : undefined;
	const to = pageSize !== undefined && totalItems !== undefined ? Math.min((currentPage + 1) * pageSize, totalItems) : undefined;

	return (
		<div className="bg-table-header-primary border-t border-card-input-border px-8 xl:px-10 py-3 flex items-center justify-between gap-3">
			<div className="flex items-center gap-4 min-w-0">
				<div className="hidden md:block text-sm text-text-secondary">
					{from !== undefined && to !== undefined && totalItems !== undefined ? (
						<>
							Showing <span className="text-text-primary">{from}</span>–<span className="text-text-primary">{to}</span> of{" "}
							<span className="text-text-primary">{totalItems}</span>
						</>
					) : null}
				</div>

				{totalPages > 1 && (
					<div className="md:hidden text-sm text-text-secondary">
						Page <span className="text-text-primary">{currentPage + 1}</span> / <span className="text-text-primary">{totalPages}</span>
					</div>
				)}

				{showPageSize && (
					<label className="flex items-center gap-2 text-sm text-text-secondary">
						<span className="hidden md:inline">Rows:</span>
						<select
							value={pageSize}
							onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
							className="bg-card-body-primary border border-card-input-border rounded-full text-sm text-text-primary px-3 py-1 focus:outline-none focus:border-text-active cursor-pointer"
							aria-label="Rows per page"
						>
							{pageSizeOptions!.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					</label>
				)}
			</div>

			{totalPages > 1 && (
				<div className="flex items-center gap-1">
					<PageNavButton disabled={!canPrev} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page">
						<FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
					</PageNavButton>

					<div className="hidden md:flex items-center gap-1">
						{items.map((item, i) =>
							item === "ellipsis" ? (
								<span key={`gap-${i}`} className="px-2 text-text-secondary select-none">
									…
								</span>
							) : (
								<PageNumberButton key={item} active={item === currentPage} onClick={() => onPageChange(item)}>
									{item + 1}
								</PageNumberButton>
							)
						)}
					</div>

					<PageNavButton disabled={!canNext} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page">
						<FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
					</PageNavButton>
				</div>
			)}
		</div>
	);
}

interface NavProps {
	disabled?: boolean;
	onClick: () => void;
	children: React.ReactNode;
	"aria-label"?: string;
}

function PageNavButton({ disabled, onClick, children, "aria-label": ariaLabel }: NavProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			aria-label={ariaLabel}
			onClick={onClick}
			className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${
				disabled
					? "border-card-input-border text-text-subheader cursor-not-allowed"
					: "border-card-input-border text-text-secondary hover:bg-menu-hover"
			}`}
		>
			{children}
		</button>
	);
}

interface NumProps {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

function PageNumberButton({ active, onClick, children }: NumProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-current={active ? "page" : undefined}
			className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-full text-sm transition-colors border ${
				active
					? "border-brand-300 dark:border-brand-700 text-text-active bg-brand-50 dark:bg-brand-900/20 font-semibold"
					: "border-transparent text-text-secondary hover:bg-menu-hover"
			}`}
		>
			{children}
		</button>
	);
}

function buildPageItems(current: number, total: number): (number | "ellipsis")[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i);

	const items: (number | "ellipsis")[] = [0];
	const windowStart = Math.max(1, current - 1);
	const windowEnd = Math.min(total - 2, current + 1);

	if (windowStart > 1) items.push("ellipsis");
	for (let p = windowStart; p <= windowEnd; p++) items.push(p);
	if (windowEnd < total - 2) items.push("ellipsis");

	items.push(total - 1);
	return items;
}
