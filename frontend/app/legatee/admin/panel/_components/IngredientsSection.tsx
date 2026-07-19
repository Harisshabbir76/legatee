"use client";

import formStyles from "@/app/styles/dashboard styling/product-form.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

// Merge both style objects so existing JSX (styles.xxx) keeps working
const styles = { ...formStyles, ...sharedStyles };

export interface IngredientDraft {
  id: string;
  name: string;
  description: string;
}

interface IngredientsSectionProps {
  rows: IngredientDraft[];
  onChange: (rows: IngredientDraft[]) => void;
}

export default function IngredientsSection({ rows, onChange }: IngredientsSectionProps) {
  function addRow() {
    onChange([...rows, { id: crypto.randomUUID(), name: "", description: "" }]);
  }

  function updateRow(id: string, patch: Partial<IngredientDraft>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    onChange(rows.filter((row) => row.id !== id));
  }

  return (
    <div>
      <div className={styles.ingredientsHeader}>
        <h4 className={styles.ingredientsTitle}>Ingredients</h4>
        <button type="button" onClick={addRow} className={styles.btnText}>
          + Add ingredient
        </button>
      </div>

      {rows.length === 0 && <p className={styles.ingredientsEmpty}>No ingredients added.</p>}

      <div className={styles.ingredientsList}>
        {rows.map((row) => (
          <div key={row.id} className={styles.ingredientRow}>
            <input
              type="text"
              placeholder="Ingredient name"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              className={styles.ingredientInput}
            />
            <input
              type="text"
              placeholder="Description"
              required
              value={row.description}
              onChange={(e) => updateRow(row.id, { description: e.target.value })}
              className={styles.ingredientInput}
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className={styles.btnOutline}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
