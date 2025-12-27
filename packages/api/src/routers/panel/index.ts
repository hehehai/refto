import { pageRouter, siteRouter, versionRouter } from "./site";
import { statRouter } from "./stat";
import { panelSubmitSiteRouter } from "./submit-site";
import { tagRouter } from "./tag";
import { userRouter } from "./user";

export const panelRouter = {
  user: userRouter,
  submitSite: panelSubmitSiteRouter,
  stat: statRouter,
  site: siteRouter,
  page: pageRouter,
  version: versionRouter,
  tag: tagRouter,
};
