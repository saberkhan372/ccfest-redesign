# Project gotchas

- Use the CC Fest preview on port 8876. The in-app browser retained another project at 8765 even after reload; fresh Chrome tests did not expose this. Verify the actual user-facing browser tab before delivering a preview. The precise cache mechanism was not diagnosed.
