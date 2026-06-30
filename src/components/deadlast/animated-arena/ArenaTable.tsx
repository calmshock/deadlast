"use client";

/**
 * ArenaTable — the central circular table (PRESENTATION ONLY)
 *
 * Renders the generated neon table asset plus a soft breathing glow beneath it.
 * No props, no state, no gameplay coupling.
 */

const TABLE_SRC = "/arena/arena_table.png";

export default function ArenaTable() {
  return (
    <>
      <div className="dl-arena__table-glow" aria-hidden="true" />
      <div
        className="dl-arena__table"
        aria-hidden="true"
        style={{ backgroundImage: `url(${TABLE_SRC})` }}
      />
    </>
  );
}
