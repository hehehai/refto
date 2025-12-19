import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/about")({
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-bold text-3xl">About Refto</h1>

      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Refto is a curated collection of beautiful design references and
          high-quality screenshots from the best websites around the world.
        </p>

        <p>
          Our mission is to help designers, developers, and creators find
          inspiration for their next project. We carefully select and organize
          design examples to make it easy for you to discover new ideas and
          trends.
        </p>

        <h2 className="font-semibold text-foreground text-xl">Features</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Curated design references from top websites</li>
          <li>High-quality screenshots and screen recordings</li>
          <li>Mobile and desktop views for responsive designs</li>
          <li>Version history to track design evolution</li>
          <li>Tag-based categorization for easy discovery</li>
        </ul>

        <h2 className="font-semibold text-foreground text-xl">Contact</h2>
        <p>Have questions or suggestions? Feel free to reach out to us.</p>

        <div className="flex gap-4">
          <a
            className="flex items-center gap-2 text-foreground hover:underline"
            href="https://example.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="i-hugeicons-user" />
            Author
          </a>
          <a
            className="flex items-center gap-2 text-foreground hover:underline"
            href="https://github.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="i-hugeicons-github" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
