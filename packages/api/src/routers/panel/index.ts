import { statRouter } from "./stat";
import { panelSubmitSiteRouter } from "./submit-site";
import { userRouter } from "./user";

export const panelRouter = {
  user: userRouter,
  submitSite: panelSubmitSiteRouter,
  stat: statRouter,
};
