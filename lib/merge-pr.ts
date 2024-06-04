import github from '@actions/github';
import type { Context } from '@actions/github/lib/context';

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

type BaseName = 'develop' | 'master';
type MergeStrategy = 'merge' | 'squash';

const MERGE_METHOD_MAP: Record<BaseName, any> = {
  develop: {
    merge: [/^master$/, /^backmerge\/.+/],
    squash: [/^feature\/.+/, /^bugfix\/.+/],
  },
  master: {
    merge: [/^release\/.+$/],
    squash: [/^hotfix\/.+$/],
  },
} as const;

function getMergeMethod(baseName: BaseName, headName: string): MergeStrategy {
  const map = MERGE_METHOD_MAP[baseName];
  const entries = Object.entries(map) as [MergeStrategy, RegExp[]][];
  for (const [strat, patterns] of entries) {
    if (patterns.some(pattern => pattern.test(headName))) {
      return strat;
    }
  }

  throw new Error(
    `No matching merge strategy found for base (${baseName}) from head (${headName}) found`,
  );
}

const { repo, owner } = context.repo;
const {
  base,
  head,
  number: pull_number,
  mergeable,
  merged,
  draft,
} = context.payload.pull_request ?? ({} as any);

const BASE_NAME = base?.ref;
const { sha, ref: HEAD_NAME } = head ?? ({} as any);

const merge_method = getMergeMethod(BASE_NAME, HEAD_NAME);

if (draft || !mergeable || merged) {
  throw new Error(
    `PR is alredy merged (${merged}), not mergeable (${mergeable}), and/or in draft (${draft}) mode.`,
  );
}

github.rest.pulls.merge({
  owner,
  repo,
  pull_number,
  // NOTE: make sure only performing a merge on the commit the label was added
  sha,
});
