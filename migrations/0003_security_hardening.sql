PRAGMA foreign_keys = ON;

-- Fixed-window counters protect public actions without retaining raw IP or
-- email identifiers. The email Worker's scheduled task removes old windows.
CREATE TABLE IF NOT EXISTS rate_limits (
  scope TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (scope, key_hash, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_updated
  ON rate_limits(updated_at);
