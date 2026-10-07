# CMS publication rollout and recovery

## Current status — October 7, 2026

Saber approved “Push and activate” on October 7. The rollout is in progress from `cms-improvements`. At the start of activation, the live site is the repaired `413b33e` revision and repository Pages settings report `build_type: legacy`, source `main`, custom domain `ccfest.rocks`, HTTPS enforced. The direct settings update and an isolated repository Actions activation job both returned HTTP 403 (Resource not accessible by integration). The repository owner has now selected GitHub Actions in Settings → Pages. The API confirms `build_type: workflow`, custom domain `ccfest.rocks`, and HTTPS enforced. The new checked Actions run and live revision must be verified after the main push.

Implementation commit `e71ad56` is pushed on `cms-improvements`. [Checked Pages publication run 37574442606](https://github.com/saberkhan372/ccfest-redesign/actions/runs/37574442606) passed the real GitHub build, tests, Chromium checks and artifact upload; deployment was skipped as intended on this branch. The current production content is unchanged. The owner resolved the Pages Source blocker after both integration update attempts returned 403. After a browser-CDN download failed on a subsequent runner, commit `23d83e9` switched to the runner’s preinstalled Chrome. [Run 37574859635](https://github.com/saberkhan372/ccfest-redesign/actions/runs/37574859635) passed all checks and uploaded the verified artifact. Source now reports workflow; the authorized promotion to main and checked production deployment are in progress. Local checks demonstrate the code path; they do not demonstrate GitHub publication or a real hosted CMS save.

The checked workflow is `.github/workflows/pages.yml`. Its deploy job depends on successful validation, regression tests, a generated Jekyll build, rendered reconciliation and Chromium checks. Pull requests and pushes to the implementation branch build and check without deploying. Only main pushes and manual runs on main may deploy.

## Activate after publication approval

1. Keep the previous live revision as the rollback reference: `413b33ea49ce6a774c9a6e61cd90490e3d1357d0`. Review the local changes and checks before requesting approval. Pushing main or changing Pages publishing is an external action.
2. Make the workflow available on main and set repository **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Coordinate these two steps so the old branch-based Jekyll publisher cannot bypass the new checks. If a content freeze is needed during the switch, announce it to the editing team through the organizer's normal process.
3. Preserve the custom domain `ccfest.rocks` and HTTPS. The artifact includes the existing CNAME. Remove/disable competing deployment workflows; only the checked artifact may publish.
4. Run **Checked Pages publication** on main. Confirm that all build steps pass, the artifact is uploaded, and the deploy job succeeds. If GitHub environment restrictions require a review, retain the repository's established policy rather than inventing new per-edit approvals.
5. Inspect the live revision query parameter, all 17 current sessions (8 workshops, panel, 8 workshops), preserved Kofi description, event title/date, calendar and poster data, and mobile/no-JS pages.
6. Confirm a deliberately invalid change fails the build and creates no deployment. Use a PR/test branch for the failure test; do not introduce broken content on main just to exercise it. Check the workflow summary for the deployed baseline and field-specific errors.
7. Complete the hosted-CMS test below. Then update this status with the successful Actions run and any observed limitations.

Switching Pages to Actions is essential: adding a workflow alone does not prevent a legacy branch-based Pages build from publishing broken content. Do not call this protection active until settings and a successful live run are verified.

## Last successful baseline

`scripts/deployed-baseline.rb` reads successful deployments in the `github-pages` environment with the workflow's read-only token. It includes successful records even when later marked inactive. Failed builds never become the identity baseline. API/network errors fail closed.

The one-time fallback is the verified live recovery SHA, used only when no successful deployment record exists. The build checks that the commit is present locally. If deployment history exceeds the lookup window, review and extend the lookup or supply a freshly verified bootstrap; never automatically use the previous content commit.

Intentional removals go in `scripts/content-removals.yml` with the exact deployed baseline and specific removed IDs. After deployment the baseline changes, so the old exception cannot authorize future unrelated deletions. ID changes are a removal plus an addition and should be rare.

## Real hosted-CMS test — pending

Use a test content branch, with the new schema loaded, rather than production. This does not require adopting a preview service; inspect the generated artifact locally or with the existing development workflow.

- Reload/reopen each of the 14 forms. Confirm labels, nested lists, required title/ID/format, English default, human-readable round options and image browser behavior.
- Save a harmless description edit. Compare the complete YAML before/after, including all nested presenter keys and IDs. Confirm the build passes.
- Assign a workshop to another valid round; clear its round; add a confirmed workshop with a new ID; clear an optional photo; replace a photo through `assets/uploads/`. Verify rendering, fallback controls, calendar eligibility, poster classification and unchanged legacy assets.
- Save one FAQ/curriculum entry, a policy paragraph and page metadata. Compare public text and formatting, anchors, credits and links.
- Keep a tab open, change the schema on the test branch, then exercise the stale-tab save. Record the actual hosted behavior. If keys disappear, confirm checks reject the commit; restore the lost fields, reload the form, and confirm recovery.
- Record the exact branch/revision, changed values, CMS results and checks. The local projection fixture is supplementary evidence, not this test.

Authenticated CMS access and its existing-tab state are unavailable in this workspace. This checklist remains unverified until an editor performs it or provides a usable authenticated session.

## When a save fails

The Git commit still exists, but the verified previous site remains live after workflow activation. Open Actions → Checked Pages publication → failed build and read the Content checks summary. It identifies the offending file/field and the successful baseline.

Restore lost values from that baseline while preserving intentional new descriptions. Correct undeclared schema keys, invalid rounds, missing images or malformed times. Reload the CMS if its schema changed, save the correction, and wait for all checks and deployment. Do not disable checks to force publication.

For a bad implementation release, revert its source changes and publish through the checked workflow after approval. If the workflow itself is broken, fix it on a branch and test before deployment; retain the live artifact while doing so. A source revert alone is not proof of deployment. Confirm the live revision afterward.

## Optional previews

No preview service, publishing channel or additional account was introduced. Branch previews and editorial review remain Phase 6 of the plan and a separate decision.
