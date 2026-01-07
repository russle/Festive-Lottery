export interface D1Database {
    prepare: (query: string) => D1PreparedStatement;
    dump: () => Promise<ArrayBuffer>;
    batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
    exec: (query: string) => Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
    bind: (...values: unknown[]) => D1PreparedStatement;
    first: <T = unknown>(colName?: string) => Promise<T | null>;
    run: <T = unknown>() => Promise<D1Result<T>>;
    all: <T = unknown>() => Promise<D1Result<T>>;
    raw: <T = unknown>() => Promise<T[]>;
}

export interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta: unknown;
}

export interface D1ExecResult {
    count: number;
    duration: number;
}
