const fs = require("fs");
const { execSync } = require("child_process");

const errors = [];

function runCheck(name, command) {
  console.log(`\n========== ${name} ==========\n`);

  try {
    execSync(command, {
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch (error) {
    const output = [
      error.stdout || "",
      error.stderr || "",
    ]
      .join("\n")
      .trim();

    if (output) {
      errors.push({
        name,
        output,
      });
    }
  }
}

runCheck(
  "TypeScript",
  "npx tsc --noEmit"
);

runCheck(
  "ESLint",
  "npx eslint ."
);

runCheck(
  "Next.js Build",
  "npx next build"
);

const filePath = "build-check/errors.txt";

if (errors.length === 0) {
  fs.writeFileSync(
    filePath,
    "BUILD SUCCESS\n\nNo errors found.\n",
    "utf8"
  );
} else {
  const content = errors
    .map(
      (error, index) => `
===============================
ERROR GROUP ${index + 1}: ${error.name}
===============================

${error.output}
`
    )
    .join("\n");

  fs.writeFileSync(
    filePath,
    content,
    "utf8"
  );
}

console.log("\n================================");
console.log("Build check completed.");
console.log(`Error groups: ${errors.length}`);
console.log(`Saved to: ${filePath}`);
console.log("================================\n");

process.exit(0);