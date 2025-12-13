import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const AuthLayout = ({ children }: React.PropsWithChildren) => (
  <div className="min-h-screen w-full bg-background">
    <div className="flex h-screen w-full">
      <div className="hidden h-full w-1/2 p-4 lg:block">
        <img
          alt="Auth background"
          className="h-full w-full rounded-xl object-cover"
          height={1400}
          src="https://picsum.photos/1000/1400"
          width={1000}
        />
      </div>
      <main className="flex w-full flex-col p-4 lg:w-1/2">
        <header className="flex shrink-0 items-center justify-between">
          <Button
            render={
              <Link to="/">
                <span className="i-hugeicons-arrow-left-01 mr-2 size-4" /> Back
              </Link>
            }
            variant="ghost"
          />
        </header>
        <div className="flex grow items-center justify-center">{children}</div>
      </main>
    </div>
  </div>
);
