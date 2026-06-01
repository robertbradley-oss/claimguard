import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = process.cwd();
const failures = [];

const toRepoPath = (absolutePath) => relative(repoRoot, absolutePath).split(sep).join("/");

const ignoredDirectories = new Set([".git", ".next", ".vercel", "node_modules"]);
const textExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
]);

const readRequiredFile = (repoPath) => {
  const absolutePath = join(repoRoot, repoPath);

  if (!existsSync(absolutePath)) {
    failures.push(`Missing required file: ${repoPath}`);
    return "";
  }

  return readFileSync(absolutePath, "utf8");
};

const walkTextFiles = (directory) => {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...walkTextFiles(absolutePath));
      }
      continue;
    }

    if (textExtensions.has(extname(entry).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
};

const allTextFiles = walkTextFiles(repoRoot).map((absolutePath) => ({
  path: toRepoPath(absolutePath),
  contents: readFileSync(absolutePath, "utf8"),
}));

const findFile = (repoPath) => allTextFiles.find((file) => file.path === repoPath)?.contents ?? "";

const packageJson = JSON.parse(readRequiredFile("package.json") || "{}");
const packageLock = readRequiredFile("package-lock.json");

const getChangedFiles = () => {
  try {
    const diffFiles = execFileSync("git", ["diff", "--name-only", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .filter(Boolean);
    const untrackedFiles = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
      cwd: repoRoot,
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .filter(Boolean);

    return new Set([...diffFiles, ...untrackedFiles].map((file) => file.split(sep).join("/")));
  } catch (error) {
    failures.push(`Unable to inspect git diff state: ${error.message}`);
    return new Set();
  }
};

const changedFiles = getChangedFiles();

const addPatternFailures = (label, files, patterns) => {
  for (const file of files) {
    for (const pattern of patterns) {
      if (pattern.test(file.contents)) {
        failures.push(`${label}: ${file.path} matched ${pattern}`);
      }
    }
  }
};

const ensurePatterns = (label, contents, patterns) => {
  for (const pattern of patterns) {
    if (!pattern.test(contents)) {
      failures.push(`${label}: missing required signal ${pattern}`);
    }
  }
};

const packageDependencyNames = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.optionalDependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
];

const blockedProviderDependencies = [
  "openai",
  "@openai/agents",
  "@google-cloud/vision",
  "@google-cloud/documentai",
  "@aws-sdk/client-textract",
  "aws-sdk",
];

for (const dependencyName of blockedProviderDependencies) {
  if (packageDependencyNames.includes(dependencyName)) {
    failures.push(`Provider dependency is not allowed before approval: ${dependencyName}`);
  }
}

if (/"(?:openai|@openai\/agents|@google-cloud\/vision|@google-cloud\/documentai|@aws-sdk\/client-textract|aws-sdk)"/i.test(packageLock)) {
  failures.push("Provider dependency lockfile entry found before approval.");
}

const sourceFiles = allTextFiles.filter((file) => file.path.startsWith("src/"));
const scriptFiles = allTextFiles.filter((file) => file.path.startsWith("scripts/"));
const docsFiles = allTextFiles.filter((file) => file.path.endsWith(".md"));
const sandboxDocs = docsFiles.filter((file) => /PHASE_4_(?:19|20|21|22|23|24|25|26|27|28|29)_/.test(file.path));
const sourceAndScriptFiles = [...sourceFiles, ...scriptFiles];

addPatternFailures("Provider SDK import guard", sourceAndScriptFiles, [
  /from\s+["'](?:openai|@openai\/agents|@google-cloud\/vision|@google-cloud\/documentai|@aws-sdk\/client-textract|aws-sdk)["']/i,
  /require\(\s*["'](?:openai|@openai\/agents|@google-cloud\/vision|@google-cloud\/documentai|@aws-sdk\/client-textract|aws-sdk)["']\s*\)/i,
  /new\s+OpenAI\s*\(/,
  /new\s+(?:Textract|Vision|DocumentProcessor)Client\s*\(/,
]);

addPatternFailures("Provider env guard", sourceAndScriptFiles, [
  /process\.env\.(?:OPENAI|GOOGLE|AWS|ANTHROPIC|OCR|VISION|TEXTRACT|DOCUMENT_AI)[A-Z0-9_]*/i,
]);

const checkScriptAllowlist = new Set([
  "scripts/check-report-semantics.mjs",
  "scripts/check-vision-sandbox-boundaries.mjs",
]);

addPatternFailures(
  "Provider call guard",
  sourceAndScriptFiles.filter((file) => !checkScriptAllowlist.has(file.path)),
  [
    /https:\/\/api\.openai\.com/i,
    /https:\/\/vision\.googleapis\.com/i,
    /textract\.[a-z0-9-]+\.amazonaws\.com/i,
    /\bresponses\.create\s*\(/i,
    /\bchat\.completions\.create\s*\(/i,
    /\banalyzeDocument\s*\(/i,
    /\bdetectDocumentText\s*\(/i,
  ],
);

const protectedRuntimeFiles = [
  "src/lib/analysis/analyzer.ts",
  "src/lib/analysis/types.ts",
  "src/lib/analysis/report-adapter.ts",
  "src/lib/analysis/scoring.ts",
  "src/lib/analysis/receipt-parser.ts",
  "src/components/ClaimReviewWorkflow.tsx",
  "src/components/ProductPhotoReviewPanel.tsx",
  "src/components/UploadPanel.tsx",
  "src/app/page.tsx",
  "src/app/api/analysis/ocr/route.ts",
  "src/app/api/analysis/mock-provider/route.ts",
];

const allowedChangedFiles = new Set([
  "AGENTS.md",
  "AGENT_LOG.md",
  "NEXT_STEPS.md",
  "REPO_SOURCE_OF_TRUTH.md",
  "ROADMAP.md",
  "package.json",
  "scripts/check-report-semantics.mjs",
  "scripts/check-vision-sandbox-boundaries.mjs",
]);

for (const changedFile of changedFiles) {
  if (
    protectedRuntimeFiles.includes(changedFile) ||
    changedFile === "package-lock.json" ||
    changedFile.startsWith("src/")
  ) {
    failures.push(`Protected runtime/package file changed during sandbox boundary phase: ${changedFile}`);
  }

  if (
    !allowedChangedFiles.has(changedFile) &&
    !/^PHASE_4_(?:26|27|28|29)_/.test(changedFile) &&
    !changedFile.startsWith("sandbox-fixtures/") &&
    !changedFile.startsWith("synthetic-fixtures/") &&
    !changedFile.startsWith("fixtures/vision-sandbox/")
  ) {
    failures.push(`Unexpected changed file for current sandbox boundary package: ${changedFile}`);
  }
}

const protectedRuntimeCorpus = protectedRuntimeFiles
  .map((repoPath) => ({ path: repoPath, contents: findFile(repoPath) }))
  .filter((file) => file.contents);

addPatternFailures("Sandbox runtime wiring guard", protectedRuntimeCorpus, [
  /PHASE_4_2[4-9]/,
  /VISION_SANDBOX/i,
  /synthetic[-_/]vision[-_/]sandbox/i,
  /fixtureMetadata/i,
  /alteredAiUncertainty/i,
]);

const ocrRoute = findFile("src/app/api/analysis/ocr/route.ts");
ensurePatterns("OCR route exact fixture boundary", ocrRoute, [
  /allowedRequestKeys/,
  /fixtureKey/,
  /UNSUPPORTED_CONTENT_TYPE/,
  /Synthetic fixture route skeleton only/,
]);

const mockProviderRoute = findFile("src/app/api/analysis/mock-provider/route.ts");
ensurePatterns("Mock provider route synthetic boundary", mockProviderRoute, [
  /providerType/,
  /mode/,
  /synthetic/,
  /runMockOcrProvider/,
  /runMockVisionProvider/,
]);

const sandboxRelevantFiles = allTextFiles.filter(
  (file) =>
    sandboxDocs.includes(file) ||
    file.path.startsWith("sandbox-fixtures/") ||
    file.path.startsWith("synthetic-fixtures/") ||
    file.path.startsWith("fixtures/vision-sandbox/"),
);
const futureArtifactFiles = allTextFiles.filter(
  (file) =>
    file.path.startsWith("sandbox-fixtures/") ||
    file.path.startsWith("synthetic-fixtures/") ||
    file.path.startsWith("fixtures/vision-sandbox/"),
);

addPatternFailures("Private identifier guard", sandboxRelevantFiles, [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b\d{3,5}\s+(?:Main|Oak|Pine|Maple|Cedar|Elm|Washington|Lake|Hill|Sunset)\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Lane|Ln)\b/i,
  /\b(?:order|tracking|ticket|case|customer|claim|evidence)[-_ ]?(?:id|number|#)\s*[:=]\s*[A-Z0-9-]{6,}\b/i,
  /\b[A-Z]{2,}-\d{3,}\b/,
]);

addPatternFailures("Provider payload/raw OCR guard", futureArtifactFiles, [
  /providerPayload\s*[:=]/i,
  /providerResponse\s*[:=]/i,
  /providerRequestId\s*[:=]/i,
  /rawOcr\s*[:=]/i,
  /raw OCR dump/i,
  /https:\/\/(?:platform\.openai\.com|console\.cloud\.google\.com|console\.aws\.amazon\.com)/i,
]);

addPatternFailures("Evidence URL/storage guard", futureArtifactFiles, [
  /https?:\/\/[^\s)]+/i,
  /blob:/i,
  /data:image\//i,
  /file:\/\//i,
  /storageHandle\s*[:=]/i,
  /objectUrl\s*[:=]/i,
  /imageUrl\s*[:=]/i,
  /dataUrl\s*[:=]/i,
]);

const metadataFiles = allTextFiles.filter(
  (file) =>
    (file.path.startsWith("sandbox-fixtures/") ||
      file.path.startsWith("synthetic-fixtures/") ||
      file.path.startsWith("fixtures/vision-sandbox/")) &&
    [".json", ".md"].includes(extname(file.path).toLowerCase()),
);

for (const metadataFile of metadataFiles) {
  ensurePatterns(`Fixture metadata policy for ${metadataFile.path}`, metadataFile.contents, [
    /fixtureKey/,
    /fixtureVersion/,
    /syntheticStatus/,
    /redactionStatus/,
    /approvalStatus/,
    /packageDistributionStatus/,
    /safeForDownloadablePackage/,
  ]);
}

const alteredAiDocs = sandboxRelevantFiles.filter((file) => /altered|AI-generated|AI generated/i.test(file.contents));

ensurePatterns("Altered/AI uncertainty wording across sandbox docs", alteredAiDocs.map((file) => file.contents).join("\n"), [
  /altered-or-AI-generated-image uncertainty/i,
  /review signal/i,
  /not proof/i,
  /not (?:a )?final decision/i,
]);

addPatternFailures("Unsafe outcome wording guard", futureArtifactFiles, [
  /fraud\s+(?:is\s+)?confirmed/i,
  /confirmed\s+fraud/i,
  /proof\s+of\s+(?:fraud|alteration|AI generation|authenticity)/i,
  /verified\s+authentic/i,
  /automatic\s+(?:deny|denial|rejection|refund|approval)/i,
  /customer\s+(?:lied|is lying|committed fraud)/i,
]);

for (const file of sandboxDocs) {
  ensurePatterns(`Observation/signal separation for ${file.path}`, file.contents, [
    /observation/i,
    /signal/i,
    /limitation/i,
    /manual-review/i,
  ]);
}

const packageArtifactPatterns = [
  /\.zip$/i,
  /\.tar$/i,
  /\.tgz$/i,
  /\.msi$/i,
  /\.exe$/i,
  /^dist\//i,
  /^release\//i,
  /^installer\//i,
  /^package-artifacts\//i,
];

for (const file of allTextFiles) {
  if (packageArtifactPatterns.some((pattern) => pattern.test(file.path))) {
    failures.push(`Package artifact path is blocked before approval: ${file.path}`);
  }
}

ensurePatterns("Phase 4.25 implementation plan package-safety signal", findFile("PHASE_4_25_VALIDATION_PROBE_IMPLEMENTATION_PLAN.md"), [
  /Package\/Distribution Safety Checks/,
  /Commit-Blocking Vs Package-Blocking Behavior/,
  /The next recommended task is Phase 4\.26 local static validation\/probe implementation only/,
]);

if (failures.length > 0) {
  console.error("ClaimGuard OpenAI Vision sandbox boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("ClaimGuard OpenAI Vision sandbox boundary check passed.");
  console.log("Checked provider/package/env, route/runtime isolation, privacy, wording, metadata, and package safety boundaries.");
}
