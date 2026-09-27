# public-skills

Agent skills for logo work, branding, interface design, standups, environment ports, and pull-request review. Each folder is one skill: `SKILL.md` plus the references and scripts it needs.

## Skills

**[logo](logo/SKILL.md)** — Builds a set of SVG marks from a short brief: several silhouette families, a favicon, and a wordmark set in real type. A small checker keeps the marks readable at favicon size. Node standard library only.

**[branding](branding/SKILL.md)** — Turns a product idea into a brand guide: name, palette, type, voice, and a page that shows the marks in use. It does not draw the marks. Install `logo` with it.

**[frontend-design](frontend-design/SKILL.md)** — Designs screens and a local design note so the interface does not look like a default template. Use it for UI, not for naming or logos. This is not Anthropic's skill of the same name.

**[daily-standup](daily-standup/SKILL.md)** — Writes a standup: the date, two short bullets per person, and one link per card, under a character limit. The card list in `references/` starts empty so a team can fill its own.

**[cherry-pick-env-prs](cherry-pick-env-prs/SKILL.md)** — Copies a merged pull request onto environment branches with `git cherry-pick -m 1`. Conflict fixes stay limited to what the port needs.

**[pr-review](pr-review/SKILL.md)** — Writes a pull-request review as a local markdown file. It does not approve, request changes, or merge. A GitHub comment exists only as an unsubmitted pending review, and only when the prompt includes `--comment`.

## Install

```bash
npx skills add RafaelHDSV/public-skills --skill logo
npx skills add RafaelHDSV/public-skills --skill branding
npx skills add RafaelHDSV/public-skills --skill frontend-design
npx skills add RafaelHDSV/public-skills --skill daily-standup
npx skills add RafaelHDSV/public-skills --skill cherry-pick-env-prs
npx skills add RafaelHDSV/public-skills --skill pr-review
```

Install `logo` together with `branding`. If the GitHub repository name differs, replace `RafaelHDSV/public-skills` in every command.

Without GitHub, point the agent at this folder, or copy a skill folder into `~/.cursor/skills/` or `~/.claude/skills/`.

## License

[MIT](LICENSE) — Rafael Vieira ([RafaelHDSV](https://github.com/RafaelHDSV)).
