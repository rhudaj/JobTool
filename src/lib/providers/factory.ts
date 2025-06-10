// Database Provider Factory
import { DatabaseProvider } from "./IDatabaseProvider";
import { MongoDBProvider } from "./mongodb";
import { FileSystemProvider } from "./filesystem";

export class DatabaseProviderFactory {
  private static instance: DatabaseProvider | null = null;
  private static isConnected = false;

  static async getProvider(): Promise<DatabaseProvider> {
    if (this.instance && this.isConnected) {
      return this.instance;
    }

    const useBackend = process.env.NEXT_PUBLIC_USE_BACKEND === "1";

    if (useBackend) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error("MONGODB_URI environment variable is required when USE_BACKEND=1");
      }
      this.instance = new MongoDBProvider(mongoUri);
      console.log("Using MongoDB provider");
    } else {
      this.instance = new FileSystemProvider();
      console.log("Using FileSystem provider");
    }

    const connected = await this.instance.connect();
    if (!connected) {
      throw new Error(`Failed to connect to ${useBackend ? 'MongoDB' : 'FileSystem'} provider`);
    }

    this.isConnected = true;
    return this.instance;
  }

  // Reset the connection (useful for testing or switching providers)
  static reset() {
    this.instance = null;
    this.isConnected = false;
  }
}
