CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add avatar column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

CREATE TABLE IF NOT EXISTS sessions (
  token    TEXT PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT    NOT NULL,
  images      TEXT[]  NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users can like posts (one like per user per post)
CREATE TABLE IF NOT EXISTS post_likes (
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Users can bookmark/save posts
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Users can comment on posts
CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT    NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- Notifications: simple activity feed (e.g., when someone likes your post)
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- recipient
  actor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- who performed the action
  type       TEXT    NOT NULL, -- e.g., 'like'
  post_id    INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read       BOOLEAN NOT NULL DEFAULT FALSE
);

-- Avoid duplicate like notifications for the same actor/post/recipient
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_like_notification'
  ) THEN
    CREATE UNIQUE INDEX uniq_like_notification
      ON notifications (user_id, actor_id, type, post_id)
      WHERE type = 'like';
  END IF;
END$$;

-- Users can follow other users
CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id)
);

-- Avoid duplicate follow notifications for the same actor/recipient
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_follow_notification'
  ) THEN
    CREATE UNIQUE INDEX uniq_follow_notification
      ON notifications (user_id, actor_id, type)
      WHERE type = 'follow';
  END IF;
END$$;
