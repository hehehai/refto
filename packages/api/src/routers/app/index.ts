import { filterRouter } from "./filter";
import { likeRouter } from "./like";
import { appMarkerRouter } from "./marker";
import { appSiteRouter } from "./site";
import { appUserRouter } from "./user";

export const appRouter = {
  site: appSiteRouter,
  marker: appMarkerRouter,
  like: likeRouter,
  user: appUserRouter,
  filter: filterRouter,
};
