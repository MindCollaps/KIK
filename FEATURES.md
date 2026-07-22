# Features (proposed / backlog)

Lightweight specs for features that aren't built yet. One entry per feature; keep entries short enough that a `git log` and the linked files tell the rest of the story once it ships.

---

## Grouped & translated DoesTheDogDie content warnings

**Where:** `app/pages/programm/[id].vue` (public program detail page), `server/utils/does-the-dog-die.ts`, `types/program.ts` (`ContentWarningStat` / `ContentWarningSnapshot`).

**Problem today:** `programm/[id].vue` renders one row per DoesTheDogDie `topicItemStats` entry that has more yes- than no-votes (see `confirmedWarnings` in that file). DDD tracks dozens of narrow topics per film ("Does the dog die?", "Is there a jump scare?", "Is there animal death?", "Is there a scene of sexual assault?", ...), each shown verbatim in English on an otherwise fully German site. A film can end up with 15-20 individual rows, most too granular for anyone to actually read, and the raw English topic names don't match the rest of the site's copy.

**Proposal:** add a topic-grouping and translation layer between the raw DDD snapshot and the page:

1. **Mapping table** (new, e.g. `server/utils/does-the-dog-die-topics.ts`): maps known DDD `topicId`s to a small set of German group labels — e.g. `Allgemeine Gewaltwarnung`, `Allgemeine Sexualwarnung`, `Tod / Sterben`, `Substanzkonsum`, `Blitzlicht- / photosensitive Inhalte`, `Tiere`. A handful of groups, not a 1:1 translation of every topic.
2. **Aggregation:** collapse `confirmedWarnings` by group instead of by raw topic — one row per group that has at least one confirmed topic underneath it, with the row's confidence taken from its strongest matching topic (or an average, TBD).
3. **Fallback bucket:** any `topicId` not yet in the mapping falls into a generic "Weitere Inhaltshinweise" group rather than being silently dropped — keeps new/unmapped DDD topics visible instead of invisible.
4. **Disclosure for detail:** each grouped row gets an optional expand (e.g. `<details>`) listing the specific underlying topics (original English name + yes/no counts) for anyone who wants the specifics DDD actually collected — the current per-topic data isn't lost, just not the default view.
5. **Admin side (nice-to-have):** `AdminFilmEditor.vue`'s DDD link preview could show the same grouped counts, so editors linking a film see what will actually surface publicly instead of the raw topic list.

**Open question:** static code-owned mapping (simple, reviewable in a PR, matches how rarely DDD's topic list changes) vs. an admin-editable table in the DB (more flexible, more surface area). Lean toward static to start; revisit if editors need to tweak grouping without a deploy.

**Out of scope for v1:** translating DDD's free-text `overview`/comments, or changing anything about how `searchDoesTheDogDie` / linking a film to a DDD item works.
