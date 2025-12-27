import { resolve } from "node:path";
import { config } from "dotenv";
import { nanoid } from "nanoid";

// Load .env from apps/web before importing db
config({ path: resolve(import.meta.dirname, "../../../apps/web/.env") });

const categoryTags = [
  "agency",
  "ai",
  "architecture",
  "art",
  "automotive",
  "beauty_makeup",
  "communication",
  "community",
  "crypto",
  "design",
  "desktop_app",
  "development",
  "dress",
  "digital_product",
  "e_commerce",
  "education",
  "event",
  "exhibition",
  "fashion",
  "finance",
  "food_drink",
  "font",
  "furniture",
  "gaming",
  "health",
  "hospitality",
  "hr",
  "interior_design",
  "landscaping",
  "legal",
  "literature",
  "magazine",
  "manufacturing",
  "marketing",
  "medicine",
  "mobile_app",
  "motion",
  "music",
  "news",
  "nft",
  "personal",
  "pet",
  "photography",
  "plugin",
  "podcast",
  "political",
  "portfolio",
  "product",
  "public_relations",
  "real_estate",
  "restaurant",
  "saas",
  "science",
  "security",
  "sports",
  "technology",
  "travel",
  "web_app",
  "web3",
];

const sectionTags = [
  "bento_grid",
  "big_background_image",
  "big_background_video",
  "grid",
  "horizontal_layout",
  "masonry",
  "single_page",
  "unusual_layout",
];

const styleTags = [
  "3d",
  "animation",
  "audio",
  "black_white",
  "clean",
  "colorful",
  "custom_cursor",
  "dark",
  "drag_drop",
  "fun",
  "gradient",
  "horizontal_scrolling",
  "illustrative",
  "infinite_scroll",
  "interactive",
  "large_type",
  "light",
  "light_shadow",
  "long_scrolling",
  "minimal",
  "mimicry",
  "monochromatic",
  "parallax",
  "pastel",
  "retro",
  "scrolling_animation",
  "small_type",
  "transitions",
  "typographic",
  "virtual_reality",
  "webgl",
  "chinese",
];

// Convert value to name (e.g., "beauty_makeup" -> "Beauty Makeup")
function valueToName(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function seed() {
  // Dynamic import after dotenv is loaded
  const { db } = await import("./index");
  const { tags } = await import("./schema/tags");

  console.log("Seeding tags...");

  const allTags = [
    ...categoryTags.map((value) => ({ value, type: "category" as const })),
    ...sectionTags.map((value) => ({ value, type: "section" as const })),
    ...styleTags.map((value) => ({ value, type: "style" as const })),
  ];

  const tagRecords = allTags.map(({ value, type }) => ({
    id: nanoid(),
    name: valueToName(value),
    value,
    type,
  }));

  await db.insert(tags).values(tagRecords).onConflictDoNothing();

  console.log(`Seeded ${tagRecords.length} tags`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
