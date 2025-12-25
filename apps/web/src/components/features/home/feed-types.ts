// Feed item type - shared across feed components
export interface FeedItem {
  version: {
    id: string;
    webCover: string;
    webRecord?: string | null;
    versionDate: Date;
  };
  page: {
    id: string;
    title: string;
    slug: string;
    url: string;
  };
  site: {
    id: string;
    title: string;
    slug: string;
    logo: string;
    url: string;
  };
  liked: boolean;
}
