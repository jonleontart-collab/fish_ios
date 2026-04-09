import fs from "fs";

import { prisma } from "./prisma";

type ApifyRunResponse = {
  data: {
    id: string;
    defaultDatasetId: string;
    status: string;
  };
};

type ApifyRunStatusResponse = {
  data: {
    status: string;
  };
};

type ApifyPlaceItem = {
  searchString?: string;
  title?: string;
  imageUrls?: string[];
  image?: string;
};

function logToFile(msg: string) {
  try {
    const ts = new Date().toISOString();
    fs.appendFileSync("apify_debug.log", `[${ts}] ${msg}\n`);
    console.log(`[Apify] ${msg}`);
  } catch {}
}

export async function enrichPlacesInBackground(
  places: Array<{ id: string; name: string; city: string; region: string }>,
) {
  if (places.length === 0) {
    return;
  }

  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    logToFile("APIFY_API_TOKEN is not set. Skipping enrichment.");
    return;
  }

  logToFile(`Using Apify token (length: ${token.length}, prefix: ${token.substring(0, 15)}...)`);
  logToFile(`Starting enrichment for ${places.length} places (background via fetch)`);

  const queries = places.map((place) => {
    const location = [place.city, place.region].filter(Boolean).join(", ");
    return `${place.name} ${location}`;
  });

  try {
    logToFile(`Triggering Apify actor for queries: ${JSON.stringify(queries)}`);

    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchStringsArray: queries,
          maxCrawledPlacesPerSearch: 1,
          language: "ru",
          maxImages: 1,
          maxReviews: 0,
          scrapePlaceDetails: true,
          scrapePlaceImages: true,
          scrapePlaceReviews: false,
        }),
      },
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`Failed to trigger Apify run: ${runResponse.status} ${errorText}`);
    }

    const runData = (await runResponse.json()) as ApifyRunResponse;
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    logToFile(`Actor run started! RunID: ${runId}, DatasetID: ${datasetId}. Waiting for completion...`);

    let isFinished = false;
    let attempts = 0;
    while (!isFinished && attempts < 20) {
      attempts++;
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
      const statusData = (await statusResponse.json()) as ApifyRunStatusResponse;

      if (statusData.data.status === "SUCCEEDED") {
        isFinished = true;
      } else if (["FAILED", "ABORTED", "TIMED-OUT"].includes(statusData.data.status)) {
        throw new Error(`Apify run failed with status: ${statusData.data.status}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (!isFinished) {
      logToFile("Apify run timed out in our background polling. It might still finish on Apify.");
      return;
    }

    logToFile("Apify run succeeded! Fetching results...");

    const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch Apify items: ${itemsResponse.status}`);
    }

    const items = (await itemsResponse.json()) as ApifyPlaceItem[];
    logToFile(`Received ${items.length} records. Filtering and updating...`);

    for (const place of places) {
      let item = items.find((it) => {
        const itemSearchStr = (it.searchString || "").toLowerCase();
        return itemSearchStr.includes(place.name.toLowerCase());
      });

      if (!item) {
        item = items.find((it) => {
          const title = it.title || "";
          return title.toLowerCase().includes(place.name.toLowerCase().substring(0, 4));
        });
      }

      if (!item) {
        logToFile(`[WARN] Could not match Apify result to "${place.name}".`);
        continue;
      }

      const imageUrl = item.imageUrls?.[0] ?? item.image ?? null;
      if (!imageUrl) {
        logToFile(`No image found in Apify result for "${place.name}".`);
        continue;
      }

      await prisma.place.update({
        where: { id: place.id },
        data: { coverImage: imageUrl },
      });
      logToFile(`Enriched place "${place.name}" with image: true`);
    }

    logToFile(`Enrichment finished for ${places.length} places.`);
  } catch (error) {
    logToFile(`Enrichment task failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
