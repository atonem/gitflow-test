#!/usr/bin/env zx

import inquirer from "inquirer";
import _ from "lodash";

const BRANCH_TYPES = ["feature", "bug", "release", "hotfix"];

const TICKET_REGEX = /[A-Z]+-\d+/;
const SCR_REGEX = /SCR-\d+/;

// check git is clean
// if ((await $`[[ -z $(git status --porcelain) ]]`.exitCode) != 0) {
//   console.error("dirty git dir, abort");
//   process.exit(1);
// }

console.log("argv?", argv);
function createValidateTicket(release) {
  return release
    ? (value) => SCR_REGEX.test(value)
    : (value) => !value || TICKET_REGEX.test(value);
}
function createBranchName(type, ticket, slug) {
  let branch = `${type}/`;

  if (ticket && slug) {
    branch += `${ticket}_${slug}`;
  } else {
    branch += ticket || slug;
  }

  return branch;
}

const { type } = BRANCH_TYPES.includes(argv.type)
  ? argv.type
  : await inquirer.prompt({
      name: "type",
      type: "list",
      message: "branch type",
      choices: BRANCH_TYPES,
      validate: BRANCH_TYPES.includes,
    });

const IS_RELEASE = type === "release";
const IS_HOTFIX = type === "hotfix";

const { ticket } = TICKET_REGEX.test(argv.ticket)
  ? argv.type
  : await inquirer.prompt({
      name: "ticket",
      message: "ticket",
      validate: createValidateTicket(IS_RELEASE),
    });

const { slug } = IS_RELEASE
  ? { slug: "" }
  : argv.slug
    ? _.kebabCase(agv.slug)
    : await inquirer.prompt({
        name: "slug",
        message: "name",
        filter: _.kebabCase,
        validate: (value) => (ticket ? true : 0 < value.length),
      });

const branch = createBranchName(type, ticket, slug);
const currentBranch = await $`git branch --show-current`
  .then(String)
  .then((v) => v.trim());

if (IS_HOTFIX && currentBranch !== "master") {
  await $`git checkout master`;
} else if (currentBranch !== "develop") {
  await $`git checkout develop`;
}

await $`git pull`;
await $`git checkout -b ${branch}`;
// console.log("finished!", { type, ticket, slug, branch });
