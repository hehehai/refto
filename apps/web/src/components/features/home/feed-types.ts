// Feed item type - shared across feed components
export interface FeedItem {
  version: {
    id: string;
    webCover: string;
    webRecord?: string | null;
  };
  page: {
    id: string;
    title: string;
    url: string;
  };
  site: {
    id: string;
    title: string;
    logo: string;
    url: string;
  };
  liked: boolean;
}
