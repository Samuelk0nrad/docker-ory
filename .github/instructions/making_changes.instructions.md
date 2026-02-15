---
applyTo: "**"
---

Every time if you change something in the nextjs application validate your changes for typescript errors and run these commands for validation:

1. `cd example-next-app` (make sure you are in the right directory)
2. `bun run build`
3. `bun run lint`
4. `bun run test:all`

before finishing make sure that there are no more issues with the changes you made (exept if the user states something different)!

after finalizing the changes read the documentation (README.md / doc / docs) and update it if necessary (but not add new documentation if it is not necessary, just update the existing one if it is outdated or wrong).
