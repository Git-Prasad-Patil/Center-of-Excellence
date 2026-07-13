const common = [
  "features/**/*.feature",
  "--require-module ts-node/register",
  "--require features/support/**/*.ts",
  "--require features/step-definitions/**/*.ts",
  "--format progress-bar",
  "--format html:cucumber-report.html",
].join(" ");

module.exports = {
  default: common,
};
