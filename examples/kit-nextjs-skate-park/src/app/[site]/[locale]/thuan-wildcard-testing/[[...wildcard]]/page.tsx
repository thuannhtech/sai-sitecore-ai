import DefaultPage, {
  generateMetadata as generateDefaultMetadata,
} from "../../[[...path]]/page";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    site: string;
    locale: string;
    wildcard?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const buildPath = (wildcard?: string[]) => [
  "thuan-wildcard-testing",
  ...(wildcard ?? []),
];

export default async function ThuanWildcardTestingPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedPath = buildPath(resolvedParams.wildcard);

  console.log("[thuan-wildcard-testing] route hit", {
    site: resolvedParams.site,
    locale: resolvedParams.locale,
    wildcard: resolvedParams.wildcard ?? [],
    path: resolvedPath,
  });

  return DefaultPage({
    params: Promise.resolve({
      ...resolvedParams,
      path: resolvedPath,
    }),
    searchParams,
  });
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const resolvedPath = buildPath(resolvedParams.wildcard);

  console.log("[thuan-wildcard-testing] metadata hit", {
    site: resolvedParams.site,
    locale: resolvedParams.locale,
    wildcard: resolvedParams.wildcard ?? [],
    path: resolvedPath,
  });

  return generateDefaultMetadata({
    params: Promise.resolve({
      ...resolvedParams,
      path: resolvedPath,
    }),
    searchParams: Promise.resolve({}),
  });
}
