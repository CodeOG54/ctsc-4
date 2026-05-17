-- ============================================================
-- CHATBOT IMPROVEMENTS
-- 1) Auto-invalidate embeddings when KB content changes
-- 2) Chat logs table for observability
-- Run this once in the Supabase SQL editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Auto-invalidate embeddings on content change
-- ------------------------------------------------------------
-- Add a content hash column so we can detect changes.
ALTER TABLE kb_documents
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Trigger: whenever title/content changes, null out embedding
-- and refresh the hash. The embed-knowledge-base function will
-- pick it up next time it runs.
CREATE OR REPLACE FUNCTION kb_documents_invalidate_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_hash TEXT;
BEGIN
  new_hash := md5(coalesce(NEW.title,'') || '||' || coalesce(NEW.content,''));

  IF TG_OP = 'INSERT' THEN
    NEW.content_hash := new_hash;
    NEW.embedding := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.content_hash IS DISTINCT FROM new_hash
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.content IS DISTINCT FROM OLD.content THEN
      NEW.content_hash := new_hash;
      NEW.embedding := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kb_documents_invalidate_embedding_trg ON kb_documents;
CREATE TRIGGER kb_documents_invalidate_embedding_trg
BEFORE INSERT OR UPDATE ON kb_documents
FOR EACH ROW EXECUTE FUNCTION kb_documents_invalidate_embedding();

-- Backfill hash for existing rows (without nulling existing embeddings).
UPDATE kb_documents
SET content_hash = md5(coalesce(title,'') || '||' || coalesce(content,''))
WHERE content_hash IS NULL;

-- ------------------------------------------------------------
-- 2) Chat logs table (observability)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  query TEXT,
  reply TEXT,
  top_similarity FLOAT,
  match_count INT,
  used_fallback BOOLEAN DEFAULT FALSE,
  latency_ms INT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS chat_logs_created_at_idx
  ON chat_logs (created_at DESC);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so no INSERT policy needed.
-- Only admins should read. Adjust below to your admin check.
DROP POLICY IF EXISTS "chat_logs admin read" ON chat_logs;
CREATE POLICY "chat_logs admin read"
ON chat_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- ============================================================
-- DONE
-- ============================================================
