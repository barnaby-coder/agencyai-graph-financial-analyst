# Public-release checklist

This checklist records the current release-candidate state. Unchecked items
require explicit review or a future release action.

- [x] Complete `main` → `build/model-backed-analyst` diff reviewed
- [x] Secret scan passed
- [x] No Vault references
- [x] No private repository references
- [x] No private filesystem paths
- [x] No unsupported capability claims found
- [x] MIT `LICENSE` added
- [x] README judge-ready
- [ ] Desktop browser smoke accepted at approximately 1440px for the current presentation revision
- [ ] Mobile browser smoke accepted at approximately 390px for the current presentation revision
- [x] Loading state communicates the live analysis stages
- [x] Live Graph smoke passed
- [x] OpenAI model smoke passed
- [x] Evidence references resolved
- [x] Deterministic fallback passed
- [x] `npm test` passed
- [x] Local start/health smoke passed
- [ ] Deployment smoke passed for the current presentation revision
- [x] Demo URL recorded: https://capital.agencyai.me/
- [ ] Demo video recorded
- [ ] Repository visibility explicitly approved
- [ ] Final merge to `main` explicitly approved
- [ ] Public repository verified after visibility change
- [ ] ETHGlobal submission details reviewed

The repository remains private and the release candidate is not merged to
`main`. Demo video, visibility, merge, and submission items still require
explicit review and approval. The previous hosted deployment passed its
technical smoke tests; the presentation changes in the current branch still
need one hosted redeploy and browser pass before these gates are checked again.
