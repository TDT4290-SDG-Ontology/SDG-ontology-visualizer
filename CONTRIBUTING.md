# Contributing to SDG Ontology Visualizer

This guide contains all the guidelines for how you should use git with our repository.

## Overview

We have several type of branches:

1. `main` - This is the main branch of the repository and will have thoroughly tested and reviewed code. The different releases will be tagged according to what is pushed in.
2. `feature/name-of-feature` - This type of branch will contain all new features, this can be new concepts or code changes which are not fixing specific bugs. If related to backend or frontend specify this.
   > Example: `feature/contributing-guidelines` or `feature/backend/add-relational-mapping`
3. `bug/name-of-bug` - This type of branch will contain code fixing bugs we have on development branch. If related to backend or frontend then specify this.
   > Example: `bug/frontend/fix-visualization`

_NOTE: We use lisp-case for branch naming, i.e. use-a-hyphen-to-separate-words. No snake_case, PascalCase or camelCase._

## Commits

Commits should follow [this](https://chris.beams.io/posts/git-commit/) guide. Worth noting that this is an important step when your pull request is reviewed and approved and it's ready to be merged into `main`. In 90% of all cases you should use "Squash and merge", which squashes all your individual commits into a single big one. If you want all your commits on the `main`-branch use "Rebase and merge", in that case it might be necessary to first rebase your commits ([docs](https://git-scm.com/book/it/v2/Git-Tools-Rewriting-History)).

## How to PR

Development usually goes something like this:

1. A developer creates a new issue on Trello, sets labels, due date, milestone and adds description of the problem they are solving.

2. The developer branches out from `main` accordingly, for example with `feature/frontend/add-new-visualization-view`.

3. When done with the branch and thoroughly tested and documented the developer files a pull request via GitHub, follows the template and adds the correspoding Trello issue.

4. The rest of the team reviews the code, discusses it, and alters it. A minimum of **1** person must review and approve of the PR before it can be merged into `main`. The commits should be squashed and a good commit message should be written (see [Commits](#commits)).

5. The developer merges the pull request into the repository and moves the corresponding issue into the _Done_-column in the Trello board.
