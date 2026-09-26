import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

interface ContentCheck {
  readonly label: string;
  readonly fragment: string;
}

const rootDirectory: string = process.cwd();
const indexPath: string = resolve(rootDirectory, "index.html");
const stylesheetPath: string = resolve(rootDirectory, "styles.css");
const workflowPath: string = resolve(rootDirectory, ".github", "workflows", "deploy-pages.yml");

assert.ok(existsSync(indexPath), "index.html must exist at the site root");
assert.ok(existsSync(stylesheetPath), "styles.css must exist at the site root");
assert.ok(existsSync(workflowPath), "the GitHub Pages workflow must exist");

const html: string = readFileSync(indexPath, "utf8");
const workflow: string = readFileSync(workflowPath, "utf8");
const requiredContent: ReadonlyArray<ContentCheck> = [
  { label: "the flagship factor strategy", fragment: "US Large-Cap Factor Strategy" },
  { label: "live execution wording", fragment: "US Large-Cap Factor Strategy<br>&amp; Live Execution" },
  { label: "Hanyang University spelling", fragment: "HANYANG UNIVERSITY" },
  { label: "official Certified Investment Manager title", fragment: "Certified Investment Manager" },
  { label: "the merged K-Skill contribution", fragment: "K-SKILL · OFFICIAL CONTRIBUTOR" },
  { label: "the K-Skill pull request proof link", fragment: "https://github.com/NomaDamas/k-skill/pull/675" },
  { label: "HAQR position sizing", fragment: "Uncertainty-Aware" },
  { label: "Fama-French research", fragment: "Fama-French: US Replication" },
  { label: "multi-asset automation", fragment: "Multi-Asset Research Automation" },
  { label: "the additional rates research", fragment: "KRW Rates &amp; BOK Policy" },
  { label: "the additional K-ICS research", fragment: "Dynamic K-ICS FX Hedging" },
  { label: "education and background", fragment: 'id="background"' },
  { label: "contact information", fragment: 'id="contact"' },
];

const passedChecks: string[] = [];

for (const check of requiredContent) {
  assert.ok(html.includes(check.fragment), "Missing " + check.label);
  passedChecks.push(check.label);
}

const ids: string[] = Array.from(html.matchAll(/\bid="([^"]+)"/g))
  .map((match: RegExpMatchArray): string | undefined => match[1])
  .filter((id: string | undefined): id is string => id !== undefined);
const uniqueIds: Set<string> = new Set(ids);
assert.equal(uniqueIds.size, ids.length, "HTML id attributes must be unique");

const internalTargets: string[] = Array.from(html.matchAll(/href="#([^"]+)"/g))
  .map((match: RegExpMatchArray): string | undefined => match[1])
  .filter((target: string | undefined): target is string => target !== undefined);

for (const target of internalTargets) {
  assert.ok(uniqueIds.has(target), "Internal link target #" + target + " must exist");
}
passedChecks.push("unique section identifiers and working in-page links");

const repositoryLinks: RegExpMatchArray[] = Array.from(
  html.matchAll(/href="(https:\/\/github\.com\/bucheoncityboy\/[^"]+)"/g),
);
assert.ok(repositoryLinks.length >= 6, "Project cards must link to their public GitHub repositories");
assert.doesNotMatch(html, /\b010[- ]\d{3,4}[- ]\d{4}\b/, "A phone number must not be published");
passedChecks.push("public project links and contact privacy");

assert.match(workflow, /actions\/upload-pages-artifact@v4/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(workflow, /contents:\s*read/);
assert.match(workflow, /pages:\s*write/);
assert.match(workflow, /id-token:\s*write/);
passedChecks.push("GitHub Pages artifact and deployment configuration");

for (const check of passedChecks) {
  console.log("PASS " + check);
}

console.log("All " + passedChecks.length + " portfolio checks passed.");
