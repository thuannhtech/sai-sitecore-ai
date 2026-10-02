"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { widget, useSearchResults, FilterEqual, WidgetsProvider } from "@sitecore-search/react";
import { WidgetDataType } from "@sitecore-search/data";
import {
  ArrowRight,
  CalendarDays,
  Search,
  SlidersHorizontal,
  Tag,
  UserRound,
} from "lucide-react";
import { ComponentProps } from "src/lib/component-props";
import { useLocale } from "next-intl";
import config from "src/lib/config";
import { Link } from "src/i18n/navigation";

type SearchResultItem = {
  id?: string;
  name?: string;
  title?: string;
  url?: string;
  description?: string;
  image_url?: string;
  image?: string;
  author?: string | string[];
  authors?: string | string[];
  publish_date?: string;
  published_at?: string;
  date?: string;
  categories?: string | string[];
  category?: string | string[];
  blogtags?: string | string[];
  blogTags?: string | string[];
  tags?: string | string[];
  excerpt?: string;
  summary?: string;
  [key: string]: unknown;
};

type ProductSearchItem = {
  name: string;
  image?: string;
  price?: number | null;
  description?: string;
  url?: string;
  slug: string;
};

type SitecoreSearchResultsProps = ComponentProps;

type SitecoreSearchResultsInnerProps = SitecoreSearchResultsProps & {
  rfkId: string;
};

const DEFAULT_RFK_ID = "TEST";

type FacetValue = {
  id: string;
  text: string;
  count: number;
};

type FacetGroup = {
  name: string;
  label: string;
  value: FacetValue[];
};

type PreviewFacetSidebarProps = {
  facets: FacetGroup[];
  selectedFacets: Array<any>;
  onFacetClick: (params: any) => void;
  onClearFilters: () => void;
};

type PaginationProps = {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

function PaginationPreview({ totalItems, pageSize, currentPage, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-lg font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === currentPage ? "page" : undefined}
          onClick={() => onPageChange(page)}
          className={`inline-flex h-12 min-w-12 items-center justify-center rounded-full px-4 text-lg font-semibold transition ${page === currentPage
              ? "bg-slate-950 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
        >
          {page}
        </button>
      ))}
      {totalPages > endPage ? (
        <>
          <span className="px-2 text-lg font-semibold text-slate-400">...</span>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {totalPages}
          </button>
        </>
      ) : null}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-lg font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
      >
        Next
      </button>
    </nav>
  );
}

function normalizeTextList(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[|,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function flattenTextValues(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (typeof value === "string") {
    return value
      .split(/[|,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenTextValues(entry)).filter(Boolean);
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    const directTexts = [
      objectValue.displayName,
      objectValue.name,
      objectValue.label,
      objectValue.text,
      objectValue.value,
      objectValue.title,
    ]
      .flatMap((entry) => flattenTextValues(entry))
      .filter(Boolean);

    if (directTexts.length > 0) {
      return directTexts;
    }

    return Object.values(objectValue)
      .flatMap((entry) => flattenTextValues(entry))
      .filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
}

function collectValuesByKeyMatch(
  value: unknown,
  keyMatchers: string[],
  visited = new WeakSet<object>()
): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectValuesByKeyMatch(entry, keyMatchers, visited));
  }

  if (typeof value !== "object") {
    return [];
  }

  if (visited.has(value as object)) {
    return [];
  }

  visited.add(value as object);

  const record = value as Record<string, unknown>;
  const matches: string[] = [];

  for (const [key, entryValue] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase();
    const isMatch = keyMatchers.some((matcher) => {
      const matchLower = matcher.toLowerCase();
      if (!matchLower.includes("id") && (normalizedKey.includes("_id") || normalizedKey.endsWith("ids") || normalizedKey.endsWith("id"))) {
        return false;
      }
      return normalizedKey.includes(matchLower);
    });

    if (isMatch) {
      matches.push(...flattenTextValues(entryValue));
    }

    matches.push(...collectValuesByKeyMatch(entryValue, keyMatchers, visited));
  }

  return matches;
}

function getItemFieldValue(item: SearchResultItem, fieldNames: string[]): unknown {
  const rawItem = item as Record<string, any>;
  const normalizedNames = fieldNames.map((name) => name.toLowerCase());

  for (const fieldName of fieldNames) {
    const directValue = rawItem[fieldName];
    if (directValue !== undefined && directValue !== null && directValue !== "") {
      return directValue;
    }
  }

  for (const [key, value] of Object.entries(rawItem)) {
    if (normalizedNames.includes(key.toLowerCase()) && value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  const fields = rawItem.fields;
  if (!fields) {
    return undefined;
  }

  if (typeof fields === "object" && !Array.isArray(fields)) {
    for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
      if (normalizedNames.includes(key.toLowerCase()) && value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  const fieldEntries = Array.isArray(fields)
    ? fields
    : typeof fields === "object"
      ? Object.values(fields)
      : [];

  for (const field of fieldEntries as any[]) {
    const fieldName = String(field?.name ?? field?.Name ?? field?.fieldName ?? "").toLowerCase();
    if (!normalizedNames.includes(fieldName)) {
      continue;
    }

    const value =
      field?.jsonValue ??
      field?.jsonValue?.value ??
      field?.jsonValue?.src ??
      field?.jsonValue?.displayName ??
      field?.value?.src ??
      field?.value?.displayName ??
      field?.value ??
      field?.DisplayName?.value ??
      field?.Name?.value ??
      field?.fields?.DisplayName?.value ??
      field?.fields?.Value?.value ??
      field?.displayName ??
      field?.name;

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function getImageSource(item: SearchResultItem): string | undefined {
  const candidate = getItemFieldValue(item, [
    "image_link",
    "image_url",
    "image",
    "Image",
    "Thumbnail",
    "HeroImage",
    "FeaturedImage",
    "CardImage",
    "picture",
    "thumbnail",
  ]);

  if (!candidate) {
    return undefined;
  }

  if (typeof candidate === "string") {
    return candidate;
  }

  if (typeof candidate === "object") {
    const objectCandidate = candidate as Record<string, unknown>;
    const nested =
      objectCandidate.src ??
      objectCandidate.url ??
      (typeof objectCandidate.value === "string"
        ? objectCandidate.value
        : (objectCandidate.value as Record<string, unknown> | undefined)?.src) ??
      objectCandidate.image_url ??
      objectCandidate.image;

    return typeof nested === "string" ? nested : undefined;
  }

  return undefined;
}

function getTaxonomyValues(item: SearchResultItem, fieldNames: string[]): string[] {
  const candidate = getItemFieldValue(item, fieldNames);
  const directValues = flattenTextValues(candidate);
  const recursiveValues = collectValuesByKeyMatch(item, fieldNames);

  return Array.from(new Set([...directValues, ...recursiveValues])).filter(Boolean);
}

function formatDate(value: unknown): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  let dateStr = value;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z)?$/);
  if (match) {
    const [_, year, month, day, hour = "00", minute = "00", second = "00"] = match;
    dateStr = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  }

  const parsedDate = new Date(dateStr);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function PreviewFacetSidebar({
  facets = [],
  selectedFacets = [],
  onFacetClick,
  onClearFilters,
}: PreviewFacetSidebarProps) {
  const isFacetChecked = (facetId: string, facetValueId: string) => {
    return selectedFacets.some(
      (sf) => sf.facetId === facetId && sf.facetValueId === facetValueId
    );
  };

  const handleCheckboxChange = (
    facetId: string,
    facetIndex: number,
    facetValueId: string,
    facetValueIndex: number,
    checked: boolean
  ) => {
    onFacetClick({
      facetId,
      facetIndex,
      facetValueId,
      facetValueIndex,
      checked,
      type: "valueId",
    });
  };

  const visibleFacets = facets.filter(
    (group) => group.name !== "blog_tags_ids" && group.name !== "categories"
  );

  const getFacetLabel = (name: string, label: string) => {
    if (name === "blog_tags" || name === "blogTags") return "blogTags";
    if (name === "categories_names") return "categories_names";
    return label || name;
  };

  const totalActiveFilters = selectedFacets.length;

  return (
    <aside className="rounded-[28px] border border-white/65 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:sticky xl:top-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-base font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Filters
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Browse topics</h2>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
          <SlidersHorizontal size={20} aria-hidden="true" />
        </span>
      </div>

      {totalActiveFilters > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-cyan-50/50 border border-cyan-100 p-4">
          <span className="text-xl font-bold text-cyan-800">
            {totalActiveFilters} active filter{totalActiveFilters > 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xl font-bold text-cyan-855 underline hover:text-cyan-950 transition cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {visibleFacets.length === 0 ? (
          <p className="text-xl text-slate-500 italic">No filters available for this query.</p>
        ) : (
          visibleFacets.map((group, groupIdx) => (
            <section key={group.name} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-900">
                  {getFacetLabel(group.name, group.label)}
                </h3>
                <span className="rounded-full bg-white px-3.5 py-1.5 text-base font-semibold text-slate-500">
                  {group.value.length} items
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {group.value.map((item, itemIdx) => {
                  const checked = isFacetChecked(group.name, item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-4 py-3.5 transition hover:border-slate-200"
                    >
                      <span className="flex min-w-0 items-center gap-3 text-xl text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            handleCheckboxChange(
                              group.name,
                              groupIdx,
                              item.id,
                              itemIdx,
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 rounded border-slate-300 text-cyan-600 accent-cyan-600 cursor-pointer"
                          aria-label={item.text}
                        />
                        <span className="truncate">{item.text}</span>
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-base font-semibold text-slate-500">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </aside>
  );
}

function SearchSkeletonCard() {
  return (
    <article className="flex flex-col gap-6 rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row">
      <div className="h-56 w-full animate-pulse rounded-[24px] bg-slate-200 md:h-[180px] md:w-[280px] flex-shrink-0" />
      <div className="flex-1 space-y-4">
        <div className="flex gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-8 w-4/5 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-11/12 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
      </div>
    </article>
  );
}

function ResultCard({
  item,
  index,
}: {
  item: SearchResultItem;
  index: number;
}) {
  const title = String(item.title ?? item.name ?? item.id ?? `Result ${index + 1}`);
  const url = item.url ? String(item.url) : undefined;
  const description = item.description
    ? String(item.description)
    : item.excerpt
      ? String(item.excerpt)
      : item.summary
        ? String(item.summary)
        : undefined;
  const image = getImageSource(item);
  const authors = normalizeTextList(item.author ?? item.authors);
  const categories = getTaxonomyValues(item, [
    "categories_names",
    "category",
    "Categories_Names",
    "Category_Name",
    "BlogCategory",
    "BlogCategories",
  ]);
  const tags = getTaxonomyValues(item, [
    "blog_tags_names",
    "blogtags",
    "blogTags",
    "BlogTags",
    "TopicTags",
  ]);
  const publishDate = formatDate(item.publish_date ?? item.published_at ?? item.date);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.13)] md:p-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative h-56 w-full overflow-hidden rounded-[24px] bg-slate-100 md:h-[180px] md:w-[280px] flex-shrink-0">
          {image ? (
            <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" style={{ height: "100%", width: "100%" }} />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_45%,#cbd5e1_100%)]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {url ? (
            <a
              href={url}
              className="text-[2.2rem] font-semibold leading-[1.15] text-slate-950 no-underline transition-colors hover:text-cyan-800 md:text-[2.4rem]"
            >
              {title}
            </a>
          ) : (
            <h2 className="text-[2.2rem] font-semibold leading-[1.15] text-slate-950 md:text-[2.4rem]">{title}</h2>
          )}

          {description ? (
            <p className="mt-4 max-w-3xl text-xl leading-8 text-slate-600">{description}</p>
          ) : null}

          {(categories.length > 0 || tags.length > 0) ? (
            <div className="mt-5 space-y-3">
              {categories.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xl font-semibold text-slate-500">Categories:</span>
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-xl font-semibold text-cyan-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : null}

              {tags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xl font-semibold text-slate-500">Tags:</span>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-xl font-semibold text-slate-700"
                    >
                      <Tag size={18} aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xl text-slate-500 font-medium">
            {publishDate ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3">
                <CalendarDays size={18} aria-hidden="true" />
                {publishDate}
              </span>
            ) : null}
            {authors[0] ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3">
                <UserRound size={18} aria-hidden="true" />
                {authors[0]}
              </span>
            ) : null}
          </div>

          {url ? (
            <a
              href={url}
              className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-slate-950 px-5 py-3.5 text-xl font-semibold text-white no-underline transition hover:bg-cyan-800"
            >
              Read article
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SitecoreSearchResultsInner({
  params,
  rfkId,
}: SitecoreSearchResultsInnerProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentKeyphrase = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(currentKeyphrase);
  const [productResults, setProductResults] = useState<ProductSearchItem[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [showBlog, setShowBlog] = useState(true);
  const [showProducts, setShowProducts] = useState(true);

  useEffect(() => {
    const keyword = currentKeyphrase.trim();
    if (!keyword) {
      setProductResults([]);
      setProductTotal(0);
      setIsProductsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsProductsLoading(true);
    const params = new URLSearchParams({
      q: keyword,
      page: "1",
      pageSize: "12",
      locale: locale || "en",
    });

    fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Product search failed");
        return response.json();
      })
      .then((data) => {
        setProductResults(data.items ?? []);
        setProductTotal(data.total ?? 0);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setProductResults([]);
          setProductTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsProductsLoading(false);
      });

    return () => controller.abort();
  }, [currentKeyphrase, locale]);

  const {
    actions: { onKeyphraseChange, onPageNumberChange, onFacetClick, onClearFilters },
    state: { page, selectedFacets },
    queryResult,
    query,
    widgetRef,
  } = useSearchResults<SearchResultItem>({
    query: (requestQuery) => {
      const request = requestQuery.getRequest();
      request.setSearchLimit(12);
      request.setSearchFacetAll(true);
      request.setSearchFacetTypeFilterType("and");

      // Dynamically override methods to intercept SDK hardcoded 'or' defaults and force 'and'
      const req = request as any;
      req.buildFacetTypeFilters = function (values: any[]) {
        if (!values || values.length === 0) {
          return undefined;
        }
        return {
          type: "and",
          values,
        };
      };

      const originalAdd = req.addSearchFacetTypeFilter;
      req.addSearchFacetTypeFilter = function (name: string, value: any) {
        return originalAdd.call(this, name, value, "and");
      };

      if (locale) {
        request.setSearchFilter(new FilterEqual("language", locale));
      }

      if (currentKeyphrase) {
        request.setSearchQueryKeyphrase(currentKeyphrase);
      } else {
        request.resetSearchQueryKeyphrase();
      }
    },
  });

  useEffect(() => {
    setInputValue(currentKeyphrase);
    onKeyphraseChange({ keyphrase: currentKeyphrase });
    onPageNumberChange({ page: 1 });
  }, [onKeyphraseChange, onPageNumberChange, currentKeyphrase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmedValue = inputValue.trim();

    if (trimmedValue) {
      nextParams.set("q", trimmedValue);
    } else {
      nextParams.delete("q");
    }

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const results = queryResult.data?.content ?? [];
  const totalResults = queryResult.data?.total_item ?? 0;
  const visibleBlogResults = showBlog ? results : [];
  const visibleProductResults = showProducts ? productResults : [];
  const combinedTotal = (showBlog ? totalResults : 0) + (showProducts ? productTotal : 0);
  const containerStyles = params?.styles ?? "";
  const renderingId = params?.RenderingIdentifier;
  const isSearchLoading = queryResult.isLoading || queryResult.isFetching;

  return (
    <section
      ref={widgetRef}
      id={renderingId}
      data-rfkid={rfkId}
      className={`relative isolate overflow-hidden bg-white ${containerStyles}`}
    >
      <div className="relative mx-auto max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8 lg:py-[72px]">
        <div className="rounded-[36px] border border-slate-200 bg-white p-5 shadow-[0_30px_120px_rgba(15,23,42,0.06)] md:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-10">
            <PreviewFacetSidebar
              facets={queryResult.data?.facet ?? []}
              selectedFacets={selectedFacets}
              onFacetClick={onFacetClick}
              onClearFilters={onClearFilters}
            />

            <div className="min-w-0">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8">
                <div className="mt-6 max-w-3xl">
                  <h1 className="text-[2.75rem] font-semibold leading-none text-slate-950 md:text-[4.5rem]">
                    Search Result
                  </h1>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8"
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                    <div className="relative flex items-center">
                      <Search
                        size={20}
                        className="absolute left-5 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full rounded-[22px] border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-6 text-lg text-slate-950 placeholder-slate-400 focus:border-slate-350 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-350 transition-all font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex h-full cursor-pointer items-center justify-center gap-2 rounded-[22px] bg-slate-950 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
                    >
                      Search
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between md:p-5">
                <div>
                  <p className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Search summary
                  </p>
                  <div className="mt-2 text-2xl font-semibold text-slate-950 md:text-[2.35rem]">
                    {isSearchLoading || isProductsLoading
                      ? "Searching the archive..."
                      : `${combinedTotal} results${currentKeyphrase ? ` for "${currentKeyphrase}"` : " across the archive"}`}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-lg font-medium text-slate-600">
                    Cards
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-lg font-medium text-slate-600">
                    Most relevant
                  </span>
                </div>
              </div>

              <fieldset className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <legend className="px-1 text-sm font-semibold text-slate-700">Type</legend>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={showBlog} onChange={(event) => setShowBlog(event.target.checked)} className="h-4 w-4 accent-slate-900" />
                  Content/Blog
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={showProducts} onChange={(event) => setShowProducts(event.target.checked)} className="h-4 w-4 accent-slate-900" />
                  Product/Supply
                </label>
              </fieldset>

              {queryResult.isError ? (
                <div className="mt-6 rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-900 shadow-[0_20px_40px_rgba(239,68,68,0.08)]">
                  <p className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
                    Search error
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">The search service did not respond.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-red-800/90">
                    Keep the shell visible, show a clear fallback, and prompt the user to retry
                    without losing their keyword.
                  </p>
                </div>
              ) : null}

              {!queryResult.isError && isSearchLoading ? (
                <div className="mt-6 space-y-4">
                  <SearchSkeletonCard />
                  <SearchSkeletonCard />
                  <SearchSkeletonCard />
                </div>
              ) : null}

              {!isSearchLoading && !isProductsLoading && !queryResult.isError && visibleBlogResults.length === 0 && visibleProductResults.length === 0 ? (
                <div className="mt-6 rounded-[32px] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white">
                    <Search size={24} aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold text-slate-950">No results found.</h2>
                </div>
              ) : null}

              {!isSearchLoading && !isProductsLoading && (visibleBlogResults.length > 0 || visibleProductResults.length > 0) ? (
                <>
                  <div className="mt-6 space-y-4">
                    {visibleBlogResults.map((item, index) => (
                      <ResultCard key={`blog-${String(item.id ?? item.url ?? index)}`} item={item} index={index} />
                    ))}
                    {visibleProductResults.map((product) => (
                      <article key={`product-${product.slug}`} className="flex flex-col gap-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                        {product.image ? <img src={product.image} alt={product.name} className="h-48 w-full rounded-2xl object-cover sm:w-64" /> : null}
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sky-700">Product/Supply</p>
                          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{product.name}</h2>
                          {product.description ? <p className="mt-2 line-clamp-3 text-slate-600">{product.description}</p> : null}
                          {product.price != null ? <p className="mt-3 font-semibold text-slate-900">${product.price.toFixed(2)}</p> : null}
                          {product.url ? <Link href={product.url as any} className="mt-3 inline-flex items-center gap-2 font-semibold text-sky-700 hover:underline">View product <ArrowRight size={16} /></Link> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                  {showBlog && visibleBlogResults.length > 0 ? <PaginationPreview
                    totalItems={totalResults}
                    pageSize={12}
                    currentPage={page}
                    onPageChange={(pageNumber) => onPageNumberChange({ page: pageNumber })}
                  /> : null}
                </>
              ) : null}

              <div className="hidden">{query.getRequest().getSearchQueryKeyphrase()}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const SearchResultsWidget = widget(
  SitecoreSearchResultsInner,
  WidgetDataType.SEARCH_RESULTS,
  "blogitem"
);

export default function Default(props: SitecoreSearchResultsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1380px] p-5 space-y-4">
        <SearchSkeletonCard />
        <SearchSkeletonCard />
      </div>
    );
  }

  const { env, customerKey, serviceHost, apiKey, publicSuffix, trackConsent } = config.sitecoreSearch;
  
  // Strict matching to SitecoreSearchProvider's validation to prevent No QueryClient context crash
  const isValidEnv = !!env && env !== "undefined" && env !== "null" && ["prod", "prodEu", "apse2"].includes(env);
  const isValidCustomerKey = !!customerKey && customerKey !== "undefined" && customerKey !== "null" && customerKey.trim() !== "";
  const isValidApiOrHost = (!!serviceHost && serviceHost !== "undefined" && serviceHost.trim() !== "") || 
                           (!!apiKey && apiKey !== "undefined" && apiKey.trim() !== "");

  const isSearchConfigured = isValidEnv && isValidCustomerKey && isValidApiOrHost;

  if (!isSearchConfigured) {
    if (props.page?.mode?.isEditing) {
      // In Sitecore Pages Editor, if search is not configured, show a stunning Mockup/Preview Mode of the component!
      return (
        <div className="relative isolate overflow-hidden bg-white">
          <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8 lg:py-[72px]">
            <div className="rounded-[36px] bg-amber-50/60 border border-amber-200 p-4 mb-6 text-center text-amber-800 text-lg font-semibold shadow-sm">
              ⚠️ Sitecore Search API is not configured on this Editing Host. Showing a premium interactive mockup for Page Editor preview.
            </div>
            
            <div className="rounded-[36px] border border-slate-200 bg-white p-5 shadow-[0_30px_120px_rgba(15,23,42,0.06)] md:p-8 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-10">
                {/* Mock Facet Sidebar */}
                <aside className="rounded-[28px] border border-white/65 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:sticky xl:top-8">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="m-0 text-base font-semibold uppercase tracking-[0.22em] text-cyan-700">Filters</p>
                      <h2 className="mt-2 text-3xl font-bold text-slate-900">Browse topics</h2>
                    </div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
                      <SlidersHorizontal size={20} aria-hidden="true" />
                    </span>
                  </div>
                  
                  <div className="mt-6 space-y-6">
                    <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-bold text-slate-900">categories_names</h3>
                        <span className="rounded-full bg-white px-3.5 py-1.5 text-base font-semibold text-slate-500">2 items</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-4 py-3.5 transition hover:border-slate-200">
                          <span className="flex min-w-0 items-center gap-3 text-xl text-slate-700 font-medium">
                            <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-cyan-600 accent-cyan-600 cursor-pointer" defaultChecked readOnly />
                            <span className="truncate">marketing-automation</span>
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-base font-semibold text-slate-500">4</span>
                        </label>
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-4 py-3.5 transition hover:border-slate-200">
                          <span className="flex min-w-0 items-center gap-3 text-xl text-slate-700 font-medium">
                            <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-cyan-600 accent-cyan-600 cursor-pointer" readOnly />
                            <span className="truncate">personalization</span>
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-base font-semibold text-slate-500">2</span>
                        </label>
                      </div>
                    </section>
                  </div>
                </aside>

                {/* Mock Search Results */}
                <div className="min-w-0">
                  <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8">
                    <h1 className="text-[2.75rem] font-semibold leading-none text-slate-950 md:text-[4.5rem]">Find blog posts fast.</h1>
                    <div className="mt-8 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                      <div className="relative flex items-center">
                        <Search size={20} className="absolute left-5 text-slate-400" />
                        <input type="text" placeholder="Search posts..." defaultValue="Skateboarding" className="w-full rounded-[22px] border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-6 text-lg text-slate-950 transition-all font-medium" readOnly />
                      </div>
                      <button className="inline-flex h-full items-center justify-center gap-2 rounded-[22px] bg-slate-950 px-6 py-4 text-lg font-semibold text-white cursor-not-allowed">
                        Search <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between md:p-5">
                    <div>
                      <p className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Search summary</p>
                      <div className="mt-2 text-2xl font-semibold text-slate-950 md:text-[2.35rem]">2 results for "Skateboarding"</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Mock Result Card 1 */}
                    <article className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6 animate-pulse-slow">
                      <div className="flex flex-col gap-6 md:flex-row">
                        <div className="relative h-56 w-full overflow-hidden rounded-[24px] bg-slate-100 md:h-[180px] md:w-[280px] flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100 to-blue-50 opacity-80 animate-gradient" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <h2 className="text-[2.2rem] font-semibold leading-[1.15] text-slate-950 md:text-[2.4rem]">Mastering the Kickflip at Skatepark</h2>
                          <p className="mt-4 max-w-3xl text-xl leading-8 text-slate-600">Learn the essential steps to master the kickflip, from foot placement to landing safely on your board.</p>
                          <div className="mt-5 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xl font-semibold text-slate-500">Categories:</span>
                              <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-xl font-semibold text-cyan-800">marketing-automation</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>

                    {/* Mock Result Card 2 */}
                    <article className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6">
                      <div className="flex flex-col gap-6 md:flex-row">
                        <div className="relative h-56 w-full overflow-hidden rounded-[24px] bg-slate-100 md:h-[180px] md:w-[280px] flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100 to-blue-50 opacity-80" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <h2 className="text-[2.2rem] font-semibold leading-[1.15] text-slate-950 md:text-[2.4rem]">Best Skateboards for Beginners in 2026</h2>
                          <p className="mt-4 max-w-3xl text-xl leading-8 text-slate-600">A comprehensive guide to choosing your first skateboard, with reviews of top brands and setups.</p>
                          <div className="mt-5 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xl font-semibold text-slate-500">Categories:</span>
                              <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-xl font-semibold text-cyan-800">personalization</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[1380px] px-4 py-20 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <SlidersHorizontal size={28} />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-slate-900">Search is currently unavailable</h2>
        <p className="mt-3 text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
          The Sitecore Search integration requires environment configuration. Please set up the search environment variables on your hosting platform and trigger a new redeployment.
        </p>
      </div>
    );
  }

  return (
    <WidgetsProvider
      env={env as any}
      customerKey={customerKey}
      serviceHost={serviceHost}
      apiKey={apiKey}
      publicSuffix={publicSuffix}
      trackConsent={trackConsent}
    >
      <SearchResultsWidget {...props} rfkId={DEFAULT_RFK_ID} />
    </WidgetsProvider>
  );
}
