async function main() {
  console.log("Seed skipped: demo content is disabled for release builds.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
