import { db } from "@/lib/db";
import { pagination } from "@/lib/pagination";
import {
  type QueryRefSite,
  type QueryWithCursorRefSite,
} from "@/lib/validations/ref-site";
import { Prisma, type RefSite } from "@prisma/client";

export async function queryWithCursor(input: QueryWithCursorRefSite) {
  const { search, limit, cursor, orderBy, tags, hasTop } = input;

  console.log("orderBy", orderBy);

  const whereInput: Prisma.RefSiteWhereInput = {
    deletedAt: null,
    isTop: hasTop ? true : false,
  };

  if (search) {
    whereInput.OR = [
      {
        siteName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        siteTitle: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        siteUrl: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (tags.length) {
    whereInput.siteTags = {
      hasSome: tags,
    };
  }

  const rows = await db.refSite.findMany({
    where: whereInput,
    select: {
      id: true,
      siteUrl: true,
      siteName: true,
      siteFavicon: true,
      siteCover: true,
      siteCoverHeight: true,
      siteCoverWidth: true,
      likes: true,
      visits: true,
    },
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    orderBy: orderBy?.reduce(
      (acc, item) => ({ ...acc, [item.key]: item.dir }),
      {},
    ),
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (rows && rows.length > limit) {
    const nextItem = rows.pop();
    nextCursor = nextItem?.id;
  }

  return {
    rows,
    nextCursor,
  };
}

export async function query(input: QueryRefSite) {
  const { search, limit, page, orderBy, tags } = input;

  console.log('orderBy', orderBy)

  const whereInput: Prisma.RefSiteWhereInput = {
    deletedAt: null,
  };

  if (search) {
    whereInput.OR = [
      {
        siteName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        siteTitle: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        siteUrl: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (tags.length) {
    whereInput.siteTags = {
      hasSome: tags,
    };
  }

  const rows = await db.refSite.findMany({
    where: whereInput,
    select: {
      id: true,
      siteUrl: true,
      siteName: true,
      siteTitle: true,
      siteFavicon: true,
      createdAt: true,
      likes: true,
      visits: true,
      isTop: true,
    },
    skip: page * limit,
    take: limit,
    orderBy: orderBy?.reduce(
      (acc, item) => ({ ...acc, [item.key]: item.dir }),
      {},
    ),
  });

  const total = await db.refSite.count({
    where: whereInput,
  });

  return {
    rows,
    ...pagination(page, limit, total),
  };
}

export async function detail(id: string) {
  "use server";
  return db.refSite.findUnique({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function correlation(tags: string[], excludeIds?: string[]) {
  "use server";

  const sql = Prisma.sql`SELECT
	*
FROM
	ref_sites
WHERE
	"siteTags" && ARRAY [${Prisma.join(tags)}] -- 包含任意一个标签
  ${excludeIds?.length ? Prisma.sql`AND id NOT IN (${Prisma.join(excludeIds)})` : Prisma.empty} -- 排除指定项
ORDER BY
	(
		SELECT
			COUNT(*) -- 计算匹配项数量
		FROM
			unnest("siteTags") AS t
		WHERE
			t IN(${Prisma.join(tags)})    
  ) DESC
	LIMIT 6;
`;

  const sites: RefSite[] = await db.$queryRaw(sql);

  return sites.map((site) => ({
    id: site.id,
    siteUrl: site.siteUrl,
    siteName: site.siteName,
    siteFavicon: site.siteFavicon,
    siteCover: site.siteCover,
    siteCoverWidth: site.siteCoverWidth,
    siteCoverHeight: site.siteCoverHeight,
    likes: site.likes,
    visits: site.visits,
  }));
}
