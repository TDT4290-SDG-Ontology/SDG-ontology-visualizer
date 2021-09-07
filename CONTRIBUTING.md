# Contributing to SDG Ontology Visualizer

This guide contains all the guidelines for how you should use git with our repository.

## Overview

We have several type of branches:

1. `main` - This is the main branch of the repository and will have thoroughly tested and reviewed code. The different releases will be tagged according to what is pushed in.
2. `feature/name-of-feature` - This type of branch will contain all new features, this can be new concepts or code changes which are not fixing specific bugs.
   > Example: `feature/contributing-guidelines`
3. `bug/subsystem/issue-id/name-of-bug` - This type of branch will contain code fixing bugs we have on development branch. These branches will be merged into dev and then deleted.
   > Example: `bug/slam/64/failure-rate-jcbb`
4. `hotfix/subsystem/issue-id/name-of-hotfix` - This type of branch is used for smaller hotfixes, these can be merged directly into master or dev.
   > Example: `hotfix/slam/113/thread-rate`
5. `test/type-of-test/date-of-testrun` - This type of branch contains code related to a specific testrun with type of test (bench, atmos or trolley) and the date of the testrun. These branches can be merged into dev-branc or feature-branches and will be tagged and deleted after the testrun. The date should be formatted as dd-mm-yyyy.
   > Example: `test/sinusoidal-steering/02-11-2020`
6. `documentation/subsystem/issue-id/name-of-doc` Branches used to create or update documentation related to workflow, subsystem or the project overall. `subsystem` should be included whenever the documentation is targeting a specific system (i.e markdown file describing the system or code) or if it is directly inline code documentation.
   > Example: `documentation/detection/101/update-description-to-current-system`
7. `workflow/status/issue-id/workflow-status` where `status` should reflect either `feature`, `bug` or `hotfix`. Branches used to work on the projects workflow (fixes, updates and addition to docker, github actions etc.), CI will run automatically for these issues.
   > Example: `workflow/hotfix/168/disable-planning-ci`
8. `refactor/subsystem/issue-id/what-you-are-refactoring` Branches where you are refactoring (rewriting, making non-functional changes) a package, some file or other. 
   > Example: `refactor/can_utils/100/hardware-mocks`
9. `concept/system/issue-id/concept-name` Branches for prototyping/testing new concepts. Does not necessarily need to be merged into master.

      > Example: `concept/planning/103/rrt-planning`

   NOTE: We use lisp-case for branch naming, i.e. use-a-hyphen-to-separate-words. No snake_case, PascalCase or camelCase.

## Test branches

When preparing files for testing we use test-branches. The name should be like _test/type-of-test/date-of-testrun_, i.e. _test/atmos/10-09-2020_.

After testing do this:

1. `git tag archive/<branchname> <branchname>` - create a tag of the current branch
2. `git push origin --tags` - push all tags to remote
3. `git branch -d <branchname>` - delete the branch locally
4. `git push -d origin <branchname>` - delete the branch on remote

This will make a tag of the current branch (the testrun) and delete the branch both locally and remotely. The tag can be retrieved by doing `git checkout -b <branchname> archive/<branchname>`.

## Commits

Commits should follow [this](https://chris.beams.io/posts/git-commit/) guide. Worth noting that this is an important step when your pull request is reviewed and approved and it's ready to be merged into `master`. In 90% of all cases you should use "Squash and merge", which squashes all your individual commits into a single big one. If you want all your commits on the `master`-branch use "Rebase and merge", in that case it might be necessary to first rebase your commits ([docs](https://git-scm.com/book/it/v2/Git-Tools-Rewriting-History)). 

## How to PR

Development usually goes something like this:

1. A developer creates a new issue on either GitHub og GitKraken boards, sets labels, due date, milestone and adds description of the problem they are solving.

2. The developer branches out from `master` accordingly, for example with `feature/27/slam-preloading`.

3. When done with the branch and thoroughly tested and documented the developer files a pull request via GitHub, follows the template and adds the correspoding GitKraken issue (this is so GitKraken will automatically move the card and add labels accordingly).

4. The rest of the team reviews the code, discusses it, and alters it. A minimum of **1** person must review and approve of the PR before it can be merged into `master`. The commits should be squashed and a good commit message should be written (see [Commits](#commits)).

5. The developer merges the pull request into the repository. You should **not** close the issue yet, it will be automatically closed within a week (this is to get overview of which issues we have resolved continuously, they will be moved into the _Done_-column in GitKraken boards).

## How to tag a new release of Pipeline

1. `git fetch origin`
2. `git checkout master`
3. `git tag -a vX.X -m "Release name vX.X"`
4. `git push origin tag vX.X` 
5. Check that everything looks okay! 