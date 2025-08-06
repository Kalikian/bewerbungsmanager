-- Migration: Setze Default für Spalte "date" in "note" auf CURRENT_DATE
ALTER TABLE note ALTER COLUMN date SET DEFAULT CURRENT_DATE;
