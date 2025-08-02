/**
 * Mock implementation of lowdb/node for Jest testing
 */

interface MockDatabase<T> {
  data: T;
  write: () => Promise<void>;
  read: () => Promise<void>;
}

class MockJSONFilePreset<T> implements MockDatabase<T> {
  public data: T;

  constructor(_filePath: string, defaultData: T) {
    this.data = defaultData;
  }

  async write(): Promise<void> {
    // Mock implementation - no actual file I/O
    return Promise.resolve();
  }

  async read(): Promise<void> {
    // Mock implementation - no actual file I/O
    return Promise.resolve();
  }
}

export const JSONFilePreset = <T>(filePath: string, defaultData: T): Promise<MockDatabase<T>> => {
  return Promise.resolve(new MockJSONFilePreset(filePath, defaultData));
};
