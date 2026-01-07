-- FestiveLottery D1 資料庫結構

-- 員工表
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dept TEXT DEFAULT '未分類',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 獎項表
CREATE TABLE IF NOT EXISTS prizes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🎁',
    count INTEGER DEFAULT 1,
    type TEXT DEFAULT 'single',
    count_per_round INTEGER DEFAULT 1
);

-- 中獎記錄表
CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prize_id INTEGER NOT NULL,
    employee_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_winners_employee ON winners(employee_id);
CREATE INDEX IF NOT EXISTS idx_winners_prize ON winners(prize_id);
