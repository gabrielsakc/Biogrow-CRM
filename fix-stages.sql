-- Fix pipeline stage names: Spanish → English
-- Run via: pnpm db:studio  OR  npx prisma db execute --file fix-stages.sql (from packages/database)

UPDATE "PipelineStage" SET name = 'Prospect'    WHERE name = 'Prospecto';
UPDATE "PipelineStage" SET name = 'Qualified'   WHERE name = 'Calificado';
UPDATE "PipelineStage" SET name = 'Proposal'    WHERE name = 'Propuesta';
UPDATE "PipelineStage" SET name = 'Negotiation' WHERE name IN ('Negociación', 'Negociacion');
UPDATE "PipelineStage" SET name = 'Won'         WHERE name = 'Ganado';
UPDATE "PipelineStage" SET name = 'Lost'        WHERE name = 'Perdido';
