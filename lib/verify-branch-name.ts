import * as core from '@actions/core';
// import * as github from '@actions/github';
import type { Context } from '@actions/github/lib/context';
// import { context } from '@actions/github';

const context = {
  payload: {
    pull_request: {
      base: {
        name: process.argv[2],
      },
      head: {
        name: process.argv[3],
      },
    },
  },
} as any as Context;

const VALID_DEVELOP_HEAD_NAMES = [
  /^feature\/.+/,
  /^bugfix\/.+/,
  /^backmerge\/.+/,
  /^master$/,
] as const;

const VALID_MASTER_HEAD_NAMES = [/^release\/.+/, /^hotfix\/.+/] as const;
const MASTER_NAME = 'master';
const DEVELOP_NAME = 'develop';

const { base, head } = context.payload.pull_request ?? ({} as any);
const BASE_NAME = base?.name;
const HEAD_NAME = head?.name;

function verifyHeadName(baseName: string, headName: string) {
  switch (baseName) {
    case MASTER_NAME:
      return VALID_MASTER_HEAD_NAMES.some(t => t.test(headName));
    case DEVELOP_NAME:
      return VALID_DEVELOP_HEAD_NAMES.some(t => t.test(headName));
    default:
      return false;
  }
}

const successMessageTemplate = (baseName, headName) =>
  `## :white_check_mark: Verify branch name: success
\`${headName}\` is a **valid** branch to merge in to \`${baseName}\`.
`;

const failureMessageTemplate = (baseName, headName) =>
  `## :x: Verify branch name: failure
\`${headName}\` is an **invalid** branch to merge in to \`${baseName}\`.

### Valid branch head patterns
${(baseName === DEVELOP_NAME ? VALID_DEVELOP_HEAD_NAMES : VALID_MASTER_HEAD_NAMES).map(pattern => `- \`${pattern}\``).join('\n')}
`;

let success = false;

if (BASE_NAME && HEAD_NAME) {
  const success = verifyHeadName(BASE_NAME, HEAD_NAME);
  const message = success
    ? successMessageTemplate(BASE_NAME, HEAD_NAME)
    : failureMessageTemplate(BASE_NAME, HEAD_NAME);

  core.summary.addRaw(message, true);
  core.setOutput('statusMessage', message);

  if (!success) {
    core.setFailed(`${HEAD_NAME} can't be merged into ${BASE_NAME}`);
  }
} else {
  core.setFailed(
    `Could not get PR head ("${HEAD_NAME}") and/or base ("${BASE_NAME}") name`,
  );
}
