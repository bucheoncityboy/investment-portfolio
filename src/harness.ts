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
  { label: "investment-first hero statement", fragment: "검증된 로직을 목표비중 산출과 실계좌 주문 실행까지 연결합니다." },
  { label: "the flagship US strategy", fragment: "미국 대형주 전략 검증 및<br>실계좌 주문 파이프라인" },
  { label: "order-route test framing", fragment: "SYSTEMATIC INVESTING <i>·</i> ACCOUNT ORDER TEST" },
  { label: "operations section uses tested-order wording", fragment: "US Strategy · Order-Route Test" },
  { label: "operations data step no longer references Fama-French", fragment: "<strong>Data</strong><span class=\"ops-tag\">Financial Data · Morning Brief</span>" },
  { label: "operations intro limits the claim to fills checked", fragment: "주문 생성과 실계좌 체결 확인으로 이어지는 절차를 설계했습니다." },
  { label: "step 08 uses position ledger wording", fragment: "<strong>Position / Ledger</strong>" },
  { label: "walk-forward and transaction-cost validation", fragment: "시간순 5개 Fold로 Walk-Forward" },
  { label: "execution evidence without a long-term claim", fragment: "29 BUY + 29 SELL FILLS CONFIRMED" },
  { label: "Hanyang University spelling", fragment: "HANYANG UNIVERSITY" },
  { label: "official Certified Investment Manager title", fragment: "Certified Investment Manager" },
  { label: "the merged K-Skill contribution", fragment: "K-SKILL · OFFICIAL CONTRIBUTOR" },
  { label: "the K-Skill pull request proof link", fragment: "https://github.com/NomaDamas/k-skill/pull/675" },
  { label: "HAQR downside risk and position sizing", fragment: "AI/ML 기반 하방위험 예측 및<br>포지션 사이징 연구" },
  { label: "HAQR quantified research results", fragment: "91.48%" },
  { label: "K-Skill finance research workflow", fragment: "글로벌마켓학회에서 일간·주간 브리핑" },
  { label: "K-Skill source and missing-data checks", fragment: "미확보 값은 임의 보완하지 않도록 했습니다." },
  { label: "HY-FIN activity retains Fama-French research", fragment: "Fama-French Research" },
  { label: "four ISAAC-relevant competency axes", fragment: "AI &amp; Data for Investment" },
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

const projectTitles: string[] = [
  "미국 대형주 전략 검증 및<br>실계좌 주문 파이프라인",
  "AI/ML 기반 하방위험 예측 및<br>포지션 사이징 연구",
  "K-Skill 오픈소스 반영:<br>금융시장 리서치 프로세스 자동화",
];
const selectedWork: string = html.split('id="work"')[1]?.split('id="research"')[0] ?? "";
assert.equal((selectedWork.match(/<article class="project-card/g) ?? []).length, 3, "Selected Work must contain exactly three projects");
assert.doesNotMatch(selectedWork, /Fama-French|fama-french|GRS Bootstrap p = 0\.010|Korea HML t = 3\.89/, "The Fama-French project must be removed from Selected Work");
const projectTitlePositions: number[] = projectTitles.map((title: string): number => selectedWork.indexOf(title));
assert.ok(projectTitlePositions.every((position: number): boolean => position >= 0), "All three requested projects must appear in Selected Work");
const researchWorkflow: string = html.split('<section class="section operations-section" id="research">')[1]?.split("</section>")[0] ?? "";
assert.doesNotMatch(researchWorkflow, /Fama-French|fama-french/, "Research to Operations must not reference the removed Fama-French project");
assert.equal((researchWorkflow.match(/<li>/g) ?? []).length, 9, "Research to Operations must retain its nine workflow steps");
assert.ok(
  projectTitlePositions.every((position: number, index: number): boolean => index === 0 || position > (projectTitlePositions[index - 1] ?? -1)),
  "Selected Work projects must follow the requested order",
);
assert.equal((html.match(/Fama-French Research/g) ?? []).length, 1, "Fama-French must remain only as HY-FIN activity history");
passedChecks.push("three requested projects in ISAAC-aligned order, with Fama-French retained only in HY-FIN history");

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
assert.ok(repositoryLinks.length >= 5, "Remaining project cards must link to their public GitHub repositories");
assert.equal((html.match(/href="https:\/\/github\.com\/bucheoncityboy"/g) ?? []).length, 3, "Navigation, hero, and contact GitHub links must point to the GitHub profile");
assert.doesNotMatch(html, /href="https:\/\/github\.com\/bucheoncityboy\/portfolio-index"/, "Main GitHub links must not point to the portfolio-index repository");
assert.doesNotMatch(html, /\b010[- ]\d{3,4}[- ]\d{4}\b/, "A phone number must not be published");
assert.doesNotMatch(html, /US Factor Live Execution|LIVE EXECUTION TRACKED/, "Order-route testing must not imply sustained live operations");
assert.doesNotMatch(html, /실제\s*운용|live operations|live portfolio|production trading|real portfolio operations|실제 투자 운용/i, "The portfolio must not claim sustained real-account operations");
assert.match(html, /체결 건수는 주문 경로 테스트 결과이며 장기 운용 성과를 뜻하지 않습니다\./);
passedChecks.push("public project links and contact privacy");

assert.match(workflow, /actions\/upload-pages-artifact@v4/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(workflow, /contents:\s*read/);
assert.match(workflow, /pages:\s*write/);
assert.match(workflow, /id-token:\s*write/);
passedChecks.push("GitHub Pages artifact and deployment configuration");

const stylesheet: string = readFileSync(stylesheetPath, "utf8");
assert.match(stylesheet, /@media \(max-width: 720px\)/);
assert.match(stylesheet, /\.project-grid, \.additional-grid \{ grid-template-columns: 1fr/);
assert.match(stylesheet, /\.project-grid \{\s*display: grid;\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
assert.doesNotMatch(stylesheet, /project-cross-market/, "Fama-French-only grid styling must be removed");
assert.match(stylesheet, /\.operations-section \{\s*border-block: 1px solid #e1e6ed;\s*background: #f1f3f6;\s*color: #25324a;\s*\}/);
assert.match(stylesheet, /\.ops-layout \{\s*display: block;\s*\}/);
assert.match(stylesheet, /\.ops-steps::before \{[\s\S]*?background: #c8d2df;/);
assert.doesNotMatch(html, /THE THROUGH-LINE|A research process is complete when the decision can be reviewed, repeated, and operated\.|RESEARCH <span>→<\/span> DECISION/);
assert.doesNotMatch(stylesheet, /\.ops-summary/);
passedChecks.push("responsive light workflow without the through-line card");

for (const check of passedChecks) {
  console.log("PASS " + check);
}

console.log("All " + passedChecks.length + " portfolio checks passed.");
