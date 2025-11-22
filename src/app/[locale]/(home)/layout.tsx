import { SiteHeader } from "@/app/_components/site-header";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <SiteHeader />
    <main>{children}</main>
  </div>
);

export default RootLayout;
