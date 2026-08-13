"use client";

import formStyles from "@/app/styles/dashboard styling/product-form.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

// Merge both style objects so existing JSX (styles.xxx) keeps working
const styles = { ...formStyles, ...sharedStyles };

export interface IngredientDraft {
  id: string;
  name: string;
  description: string;
  nameAr: string;
  descriptionAr: string;
}

interface IngredientsSectionProps {
  rows: IngredientDraft[];
  onChange: (rows: IngredientDraft[]) => void;
}

export default function IngredientsSection({ rows, onChange }: IngredientsSectionProps) {
  function addRow() {
    onChange([...rows, { id: crypto.randomUUID(), name: "", description: "", nameAr: "", descriptionAr: "" }]);
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
              placeholder="Ingredient name (EN)"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              className={styles.ingredientInput}
            />
            <input
              type="text"
              placeholder="Description (EN)"
              required
              value={row.description}
              onChange={(e) => updateRow(row.id, { description: e.target.value })}
              className={styles.ingredientInput}
            />
            <input
              type="text"
              placeholder="اسم المكون (AR)"
              value={row.nameAr}
              onChange={(e) => updateRow(row.id, { nameAr: e.target.value })}
              className={styles.ingredientInput}
              dir="auto"
            />
            <input
              type="text"
              placeholder="الوصف (AR)"
              value={row.descriptionAr}
              onChange={(e) => updateRow(row.id, { descriptionAr: e.target.value })}
              className={styles.ingredientInput}
              dir="auto"
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
