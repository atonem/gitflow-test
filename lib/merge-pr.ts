import * as core from '@actions/core';
import  github from '@actions/github';
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

console.log('will merge PR', context);
// github.rest.pulls.merge({
//   owner,
//   repo,
//   pull_number,
// });
