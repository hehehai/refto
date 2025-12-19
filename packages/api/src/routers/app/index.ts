import { likeRouter } from "./like";
import { appSiteRouter } from "./site";
import { appUserRouter } from "./user";

export const appRouter = {
  site: appSiteRouter,
  like: likeRouter,
  user: appUserRouter,
};
