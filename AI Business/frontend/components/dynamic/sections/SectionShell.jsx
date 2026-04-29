/**
 * SectionShell — shared wrapper for all section components.
 *
 * Provides:
 *  - Consistent padding + surface card styling driven by AI theme
 *  - Optional "delete" action in edit mode (no more per-section boilerplate)
 *  - No static type label shown to end users
 */

"use client";

import { sectionSurfaceStyle } from "../../../lib/siteTheme";
import { Button } from "../../Button";

export function SectionShell({ id, theme, editable, onDelete, children, style }) {
  return (
    <section
      id={id}
      className="p-8"
      style={{ ...sectionSurfaceStyle(theme), ...style }}
    >
      {editable && (
        <div className="mb-3 flex justify-end">
          <Button variant="secondary" type="button" onClick={onDelete}>
            Delete
          </Button>
        </div>
      )}
      {children}
    </section>
  );
}
