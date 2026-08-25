export type ByteStore = {
  name: 'opfs' | 'indexeddb' | 'memory';
  load(): Promise<Uint8Array | null>;
  save(bytes: Uint8Array): Promise<void>;
};

const OPFS_FILE = 'lyric-guess.sqlite';
const IDB_NAME = 'lyric-guess';
const IDB_STORE = 'sqlite';
const IDB_KEY = 'catalog';

export function canUseOpfs(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    typeof navigator.storage.getDirectory === 'function'
  );
}

export function canUseIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

export class OpfsByteStore implements ByteStore {
  readonly name = 'opfs' as const;

  async load(): Promise<Uint8Array | null> {
    const root = await navigator.storage.getDirectory();
    try {
      const handle = await root.getFileHandle(OPFS_FILE);
      const file = await handle.getFile();
      return new Uint8Array(await file.arrayBuffer());
    } catch {
      return null;
    }
  }

  async save(bytes: Uint8Array): Promise<void> {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(OPFS_FILE, { create: true });
    const writable = await handle.createWritable();
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    await writable.write(buffer);
    await writable.close();
  }
}

export class IndexedDbByteStore implements ByteStore {
  readonly name = 'indexeddb' as const;

  async load(): Promise<Uint8Array | null> {
    const db = await openIndexedDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const request = tx.objectStore(IDB_STORE).get(IDB_KEY);
        request.onsuccess = () => {
          const value: unknown = request.result;
          if (value instanceof Uint8Array) {
            resolve(value);
            return;
          }
          if (value instanceof ArrayBuffer) {
            resolve(new Uint8Array(value));
            return;
          }
          resolve(null);
        };
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }

  async save(bytes: Uint8Array): Promise<void> {
    const db = await openIndexedDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore(IDB_STORE).put(bytes, IDB_KEY);
      });
    } finally {
      db.close();
    }
  }
}

export class MemoryByteStore implements ByteStore {
  readonly name = 'memory' as const;
  private bytes: Uint8Array | null = null;

  async load(): Promise<Uint8Array | null> {
    return this.bytes;
  }

  async save(bytes: Uint8Array): Promise<void> {
    this.bytes = bytes;
  }
}

export async function createByteStore(): Promise<ByteStore> {
  if (canUseOpfs()) {
    try {
      await navigator.storage.getDirectory();
      return new OpfsByteStore();
    } catch {
      // OPFS can exist but reject writes in some private modes.
    }
  }

  if (canUseIndexedDb()) {
    return new IndexedDbByteStore();
  }

  return new MemoryByteStore();
}

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(IDB_STORE)) {
        request.result.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed to open'));
  });
}
