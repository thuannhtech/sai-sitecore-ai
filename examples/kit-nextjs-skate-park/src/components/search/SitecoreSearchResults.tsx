"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { widget, useSearchResults } from "@sitecore-search/react";
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

type SitecoreSearchResultsProps = ComponentProps;

type SitecoreSearchResultsInnerProps = SitecoreSearchResultsProps & {
  rfkId: string;
};

type PreviewFacetGroup = {
  title: string;
  items: Array<{
    label: string;
    count: number;
  }>;
};

type PaginationProps = {
  totalItems: number;
  pageSize: number;
};

const DEFAULT_RFK_ID = "TEST";

const PREVIEW_FACETS: PreviewFacetGroup[] = [
  {
    title: "Categories",
    items: [
      { label: "Skate Culture", count: 24 },
      { label: "Street Spots", count: 18 },
      { label: "Setup Guides", count: 12 },
    ],
  },
  {
    title: "Blog Tags",
    items: [
      { label: "Bearings", count: 16 },
      { label: "Deck Flex", count: 11 },
      { label: "Urban Sessions", count: 8 },
    ],
  },
  {
    title: "Publish Date",
    items: [
      { label: "This month", count: 14 },
      { label: "Last 6 months", count: 43 },
      { label: "Archive", count: 89 },
    ],
  },
  {
    title: "Author",
    items: [
      { label: "Mason Lee", count: 17 },
      { label: "Rina Tran", count: 13 },
      { label: "Skate Park Team", count: 21 },
    ],
  },
];

function PaginationPreview({ totalItems, pageSize }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);

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
        className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-lg font-semibold text-slate-500"
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === 1 ? "page" : undefined}
          className={`inline-flex h-12 min-w-12 items-center justify-center rounded-full px-4 text-lg font-semibold ${
            page === 1
              ? "bg-slate-950 text-white"
              : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          {page}
        </button>
      ))}
      {totalPages > pages.length ? (
        <span className="px-2 text-lg font-semibold text-slate-400">...</span>
      ) : null}
      {totalPages > pages.length ? (
        <button
          type="button"
          className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-lg font-semibold text-slate-700"
        >
          {totalPages}
        </button>
      ) : null}
      <button
        type="button"
        className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-lg font-semibold text-slate-700"
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
    const isMatch = keyMatchers.some((matcher) => normalizedKey.includes(matcher.toLowerCase()));

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

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function PreviewFacetSidebar() {
  return (
    <aside className="rounded-[28px] border border-white/65 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:sticky xl:top-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Filters
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Browse topics</h2>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
          <SlidersHorizontal size={18} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {PREVIEW_FACETS.map((group) => (
          <section key={group.title} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
              <span className="rounded-full bg-white px-3 py-1.5 text-base font-semibold text-slate-500">
                {group.items.length} groups
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {group.items.map((item) => (
                <label
                  key={item.label}
                  className="flex cursor-default items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 transition hover:border-slate-200"
                >
                  <span className="flex min-w-0 items-center gap-3 text-lg text-slate-700">
                    <input
                      type="checkbox"
                      defaultChecked={item.label === group.items[0]?.label}
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 accent-cyan-600"
                      aria-label={item.label}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-base font-semibold text-slate-500">
                    {item.count}
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function SearchSkeletonCard() {
  return (
    <article className="grid gap-5 rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="h-[180px] animate-pulse rounded-[22px] bg-slate-200" />
      <div className="space-y-4">
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
    "categories",
    "category",
    "Categories",
    "Category",
    "BlogCategory",
    "BlogCategories",
  ]).slice(0, 2);
  const tags = getTaxonomyValues(item, [
    "blogtags",
    "blogTags",
    "tags",
    "Tags",
    "BlogTags",
    "TopicTags",
  ]).slice(0, 3);
  const publishDate = formatDate(item.publish_date ?? item.published_at ?? item.date);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.13)] md:p-6">
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative min-h-[180px] overflow-hidden rounded-[24px] bg-slate-100">
          {image ? (
            <img src={image} alt={title} className="block h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_45%,#cbd5e1_100%)]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent" />
        </div>

        <div className="flex min-w-0 flex-col">
          {(categories.length > 0 || tags.length > 0) ? (
            <div className="space-y-3">
              {categories.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-slate-500">Categories:</span>
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-lg font-semibold text-cyan-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : null}

              {tags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-slate-500">Tags:</span>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-lg font-semibold text-slate-700"
                    >
                      <Tag size={16} aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {url ? (
            <a
              href={url}
              className="mt-4 text-[2rem] font-semibold leading-[1.15] text-slate-950 no-underline transition-colors hover:text-cyan-800 md:text-[2.15rem]"
            >
              {title}
            </a>
          ) : (
            <h2 className="mt-4 text-[2rem] font-semibold leading-[1.15] text-slate-950 md:text-[2.15rem]">{title}</h2>
          )}

          {description ? (
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xl text-slate-500">
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
              className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-slate-950 px-4.5 py-3 text-lg font-semibold text-white no-underline transition hover:bg-cyan-800"
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentKeyphrase = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(currentKeyphrase);

  const { actions, queryResult, query, widgetRef } = useSearchResults<SearchResultItem>({
    query: (requestQuery) => {
      const request = requestQuery.getRequest();
      request.setSearchLimit(12);

      if (currentKeyphrase) {
        request.setSearchQueryKeyphrase(currentKeyphrase);
      } else {
        request.resetSearchQueryKeyphrase();
      }
    },
  });

  useEffect(() => {
    setInputValue(currentKeyphrase);
    actions.onKeyphraseChange({ keyphrase: currentKeyphrase });
  }, [actions, currentKeyphrase]);

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
  const containerStyles = params?.styles ?? "";
  const renderingId = params?.RenderingIdentifier;

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
            <PreviewFacetSidebar />

            <div className="min-w-0">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-8">
                <div className="mt-6 max-w-3xl">
                  <h1 className="text-[2.75rem] font-semibold leading-none text-slate-950 md:text-[4.5rem]">
                    Find blog posts fast.
                  </h1>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8"
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                    <label className="flex min-w-0 items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                      <Search size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
                      <input
                        type="search"
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        placeholder="Search by keyword, topic, author, or board setup"
                        className="min-w-0 flex-1 bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400 md:text-xl"
                        aria-label="Search blog articles"
                      />
                    </label>

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
                    {queryResult.isLoading
                      ? "Searching the archive..."
                      : `${totalResults} results${currentKeyphrase ? ` for "${currentKeyphrase}"` : " across the blog archive"}`}
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

              {!queryResult.isError && queryResult.isLoading ? (
                <div className="mt-6 space-y-4">
                  <SearchSkeletonCard />
                  <SearchSkeletonCard />
                  <SearchSkeletonCard />
                </div>
              ) : null}

              {!queryResult.isLoading && !queryResult.isError && results.length === 0 ? (
              <div className="mt-6 rounded-[32px] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white">
                  <Search size={24} aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-3xl font-semibold text-slate-950">No results found.</h2>
              </div>
            ) : null}

              {!queryResult.isLoading && !queryResult.isError && results.length > 0 ? (
                <>
                  <div className="mt-6 space-y-4">
                    {results.map((item, index) => (
                      <ResultCard key={String(item.id ?? item.url ?? index)} item={item} index={index} />
                    ))}
                  </div>
                  <PaginationPreview totalItems={totalResults} pageSize={12} />
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
  return <SearchResultsWidget {...props} rfkId={DEFAULT_RFK_ID} />;
}
