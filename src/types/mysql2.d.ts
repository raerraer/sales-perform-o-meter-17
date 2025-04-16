
declare module 'mysql2/promise' {
  export interface Connection {
    query<T>(sql: string, values?: any): Promise<[T[], any]>;
    execute<T>(sql: string, values?: any): Promise<[T[], any]>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    release(): void;
    destroy(): void;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    query<T>(sql: string, values?: any): Promise<[T[], any]>;
    execute<T>(sql: string, values?: any): Promise<[T[], any]>;
    end(): Promise<void>;
  }

  export function createPool(config: any): Pool;
  export function createConnection(config: any): Promise<Connection>;
}
