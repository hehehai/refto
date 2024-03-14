import { db } from "@/lib/db";
import { Prisma, type RefSite } from "@prisma/client";

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
