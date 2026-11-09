import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

import { adminSecret, storePath } from "./constants";

test.describe.configure({ mode: "serial" });

const alphaEmail = "alpha@example.com";
const betaEmail = "beta@example.com";

let alphaReferralUrl = "";
let alphaReferralCode = "";

type StoredEntry = {
  email: string;
  unsubscribeToken: string;
  referralCode: string;
  referralCount: number;
  position: number;
  source: string | null;
  unsubscribedAt: string | null;
};

async function readStore(): Promise<{ entries: StoredEntry[] }> {
  return JSON.parse(await readFile(storePath, "utf8")) as { entries: StoredEntry[] };
}

async function waitForFormAge(page: Page) {
  await page.waitForTimeout(1_050);
}

async function assertNoA11yViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
    .analyze();

  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.map((node) => node.target),
  }));

  expect(summary, `${label} accessibility violations`).toEqual([]);
}

async function revealAll(page: Page) {
  await page.evaluate(() => {
    for (const node of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      node.classList.add("is-revealed");
    }
  });
}

async function submitWaitlist(page: Page, scope: string, email: string) {
  const form = page.locator(`${scope} form`).first();
  await form.getByLabel("Email address").fill(email);
  await form.getByRole("button", { name: "Get early access" }).click();
}

test("home page renders its core content and metadata without overlap", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Rill — Your day, quietly handled.");
  await expect(
    page.getByRole("heading", { level: 1, name: /Your day, quietly handled/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Three things off your plate." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toBe("http://localhost:3100");

  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  );
  expect(noOverflow).toBe(true);
});

test("mobile layout has no horizontal scroll and keeps 44px primary targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  );
  expect(noOverflow).toBe(true);

  const targets = [
    page.getByRole("button", { name: "Switch color theme" }),
    page.locator(".header-cta"),
    page.locator("#join").getByRole("button", { name: "Get early access" }),
  ];

  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box, "target should be visible").not.toBeNull();
    expect(box!.height, "target height should be at least 44px").toBeGreaterThanOrEqual(44);
  }
});

test("theme toggle persists and FAQ works from the keyboard", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: "Switch color theme" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "light");

  const firstFaq = page.locator("#faq details").first();
  const summary = firstFaq.locator("summary");
  const answer = firstFaq.locator(".faq-answer");

  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(firstFaq).toHaveAttribute("open", "");
  await expect(answer).toBeVisible();

  await page.keyboard.press("Space");
  await expect(firstFaq).not.toHaveAttribute("open", "");
  await expect(answer).toBeHidden();
});

test("home page has no WCAG A/AA violations in dark and light themes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await revealAll(page);

  await assertNoA11yViolations(page, "home dark");

  await page.getByRole("button", { name: "Switch color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await assertNoA11yViolations(page, "home light");

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await revealAll(page);
  await assertNoA11yViolations(page, "home mobile");
});

test("content is visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Three things off your plate." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Questions, answered plainly." })).toBeVisible();

  await context.close();
});

test("form validates empty and malformed email addresses", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("#join form");

  await form.getByRole("button", { name: "Get early access" }).click();
  await expect(form.locator(".join-error")).toContainText("Enter your email address");

  await form.getByLabel("Email address").fill("not-an-email");
  await form.getByRole("button", { name: "Get early access" }).click();
  await expect(form.locator(".join-error")).toContainText("doesn't look right");
});

test("form reports a network failure without losing the address", async ({ page }) => {
  await page.goto("/");
  await waitForFormAge(page);

  await page.route("**/api/waitlist", (route) => route.abort("connectionrefused"));

  const form = page.locator("#join form");
  await form.getByLabel("Email address").fill("offline@example.com");
  await form.getByRole("button", { name: "Get early access" }).click();

  await expect(form.locator(".join-error")).toContainText("couldn't reach the list");
  await expect(form.getByLabel("Email address")).toHaveValue("offline@example.com");

  await page.unroute("**/api/waitlist");
});

test("a person can join, see a real position, and get a referral link", async ({ page }) => {
  await page.goto("/?utm_source=e2e&utm_medium=playwright");
  await waitForFormAge(page);

  await submitWaitlist(page, "#join", alphaEmail);

  const receipt = page.locator("#join .receipt");
  await expect(receipt).toBeVisible();
  await expect(receipt.locator(".receipt-title")).toContainText("1st in line");
  await expect(receipt).toContainText("We'll write once, when your spot is ready.");

  const referralLink = receipt.locator(".referral-link code");
  await expect(referralLink).toContainText("?ref=");
  alphaReferralUrl = ((await referralLink.textContent()) ?? "").trim();
  expect(alphaReferralUrl).toMatch(/^http:\/\/localhost:3100\/\?ref=[a-z0-9]+$/);
  alphaReferralCode = new URL(alphaReferralUrl).searchParams.get("ref") ?? "";
  expect(alphaReferralCode).toMatch(/^[a-z0-9]+$/);

  const countResponse = await page.request.get("/api/waitlist/count");
  expect(countResponse.status()).toBe(200);
  expect(await countResponse.json()).toMatchObject({ ok: true, count: 1 });
});

test("a duplicate signup is friendly and does not expose the existing referral link", async ({
  page,
}) => {
  await page.goto("/");
  await waitForFormAge(page);

  await submitWaitlist(page, "#join", alphaEmail);

  const receipt = page.locator("#join .receipt");
  await expect(receipt.locator(".receipt-title")).toContainText("already in line");
  await expect(receipt.locator(".referral-link")).toHaveCount(0);

  const countResponse = await page.request.get("/api/waitlist/count");
  expect(await countResponse.json()).toMatchObject({ count: 1 });
});

test("a referral link credits the referrer and the friend receives the next place", async ({
  page,
}) => {
  expect(alphaReferralUrl).not.toBe("");

  await page.goto(alphaReferralUrl);
  await waitForFormAge(page);
  await submitWaitlist(page, "#join", betaEmail);

  await expect(page.locator("#join .receipt-title")).toContainText("2nd in line");

  const store = await readStore();
  const alpha = store.entries.find((entry) => entry.email === alphaEmail);
  const beta = store.entries.find((entry) => entry.email === betaEmail);

  expect(alpha?.referralCount).toBe(1);
  expect(beta?.referralCode).toMatch(/^[a-z0-9]+$/);

  const countResponse = await page.request.get("/api/waitlist/count");
  expect(await countResponse.json()).toMatchObject({ count: 2 });
});

test("the waitlist API rejects cross-origin, malformed, and honeypot requests", async ({
  request,
}) => {
  const baseURL = "http://localhost:3100";

  const crossOrigin = await request.post(`${baseURL}/api/waitlist`, {
    headers: { origin: "https://evil.example", "content-type": "application/json" },
    data: { email: "intruder@example.com" },
  });
  expect(crossOrigin.status()).toBe(403);

  const wrongType = await request.post(`${baseURL}/api/waitlist`, {
    headers: { "content-type": "text/plain" },
    data: "email=someone@example.com",
  });
  expect(wrongType.status()).toBe(415);

  const malformed = await request.post(`${baseURL}/api/waitlist`, {
    headers: { origin: baseURL, "content-type": "application/json" },
    data: { email: "still-not-an-email" },
  });
  expect(malformed.status()).toBe(400);

  const honeypot = await request.post(`${baseURL}/api/waitlist`, {
    headers: { origin: baseURL, "content-type": "application/json" },
    data: {
      email: "bot@example.com",
      company: "Bot Co",
      source: "e2e",
    },
  });
  expect(honeypot.status()).toBe(200);
  expect(await honeypot.json()).toMatchObject({ ok: true, status: "success", position: null });

  const countResponse = await request.get(`${baseURL}/api/waitlist/count`);
  expect(await countResponse.json()).toMatchObject({ count: 2 });

  const getResponse = await request.get(`${baseURL}/api/waitlist`);
  expect(getResponse.status()).toBe(405);
});

test("the admin dashboard is protected, shows real stats, and exports CSV", async ({
  page,
}) => {
  const unauthorized = await page.request.get("/api/admin/export");
  expect(unauthorized.status()).toBe(401);

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Waitlist admin" })).toBeVisible();

  await assertNoA11yViolations(page, "admin login");

  const loginForm = page.locator(".admin-form");
  await loginForm.getByLabel("Admin secret").fill("wrong-secret");
  await loginForm.getByRole("button", { name: "Enter admin" }).click();
  await expect(loginForm.locator(".admin-error")).toContainText("did not match");

  await loginForm.getByLabel("Admin secret").fill(adminSecret);
  await loginForm.getByRole("button", { name: "Enter admin" }).click();

  await expect(page.locator(".admin-head h1")).toHaveText("Waitlist admin");

  const activeStat = page.locator(".stat", { hasText: "On the list" }).locator(".stat-value");
  await expect(activeStat).toHaveText("2");

  const alphaRow = page.locator(".admin-table tbody tr", { hasText: alphaEmail });
  await expect(alphaRow.locator("td").nth(4)).toHaveText("1");
  await expect(alphaRow.locator("td").nth(5)).toHaveText("Active");

  const betaRow = page.locator(".admin-table tbody tr", { hasText: betaEmail });
  await expect(betaRow.locator("td").nth(3)).toHaveText("#2");

  const csv = await page.request.get("/api/admin/export");
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const csvText = await csv.text();
  expect(csvText).toContain('"position","effective_position","email","created_at","referral_code"');
  expect(csvText).toMatch(/"1","1","alpha@example\.com"/);
  expect(csvText).toMatch(/"2","2","beta@example\.com"/);

  await assertNoA11yViolations(page, "admin dashboard");

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.locator(".admin-form")).toBeVisible();
});

test("unsubscribe removes the active place, scrubs details, and allows a clean return", async ({
  page,
}) => {
  const store = await readStore();
  const alpha = store.entries.find((entry) => entry.email === alphaEmail);
  expect(alpha?.unsubscribeToken).toBeTruthy();

  await page.goto(`/unsubscribe?token=${alpha!.unsubscribeToken}`);
  await page.getByRole("button", { name: "Unsubscribe me" }).click();
  await expect(page.locator(".receipt-title")).toContainText("off the list");

  const countResponse = await page.request.get("/api/waitlist/count");
  expect(await countResponse.json()).toMatchObject({ count: 1 });

  const updated = await readStore();
  const removed = updated.entries.find((entry) => entry.email === alphaEmail);
  expect(removed?.unsubscribedAt).toBeTruthy();
  expect(removed?.source).toBeNull();
  expect(removed?.referralCode).not.toBe(alphaReferralCode);

  await page.goto("/");
  await waitForFormAge(page);
  await submitWaitlist(page, "#join", alphaEmail);
  await expect(page.locator("#join .receipt-label")).toContainText("You're on the list");

  const afterReturn = await page.request.get("/api/waitlist/count");
  expect(await afterReturn.json()).toMatchObject({ count: 2 });

  const rejoined = (await readStore()).entries.find((entry) => entry.email === alphaEmail);
  expect(rejoined?.unsubscribedAt).toBeNull();
});

test("privacy page has no WCAG A/AA violations and robots/sitemap are present", async ({
  page,
  request,
}) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy, in plain language");
  await assertNoA11yViolations(page, "privacy page");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/privacy");

  const manifest = await request.get("/site.webmanifest");
  expect(manifest.status()).toBe(200);
  expect(await manifest.json()).toMatchObject({ name: "Rill — Your day, quietly handled." });

  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});
