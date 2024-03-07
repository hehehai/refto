import { SiteHeader } from "../_components/site-header";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SiteHeader />
      <main>{children}</main>
    </div>
  );
};

export default RootLayout;
