# Database Provider Implementation

This implementation provides two database providers that implement the same interface:

## Providers

1. **MongoDBProvider** - Uses MongoDB for data storage when `NEXT_PUBLIC_USE_BACKEND=1`
2. **FileSystemProvider** - Uses local JSON files in the `public/samples` folder when `NEXT_PUBLIC_USE_BACKEND=0`

## Usage

The provider is automatically selected based on the `NEXT_PUBLIC_USE_BACKEND` environment variable:

- `NEXT_PUBLIC_USE_BACKEND=1` → Uses MongoDB (requires `MONGODB_URI`)
- `NEXT_PUBLIC_USE_BACKEND=0` → Uses FileSystem provider

## Provider Interface

Both providers implement the same `DatabaseProvider` interface:

```typescript
interface DatabaseProvider {
  // Connection/initialization
  connect(): Promise<boolean>;

  // CV operations
  all_cvs(): Promise<NamedCV[]>;
  save_new_cv(cv: NamedCV): Promise<void>;
  update_cv(cv: NamedCV, name: string): Promise<void>;
  delete_cv(name: string): Promise<void>;

  // CV Info operations
  cv_info(): Promise<CVInfo>;
  save_cv_info(newVal: CVInfo): Promise<void>;

  // Annotations operations
  save_annotation(data: Annotation): Promise<void>;
}
```

## File Structure

- `src/lib/providers/types.ts` - Common interface and types
- `src/lib/providers/mongodb.ts` - MongoDB implementation
- `src/lib/providers/filesystem.ts` - File system implementation
- `src/lib/providers/factory.ts` - Provider factory
- `src/lib/database.ts` - Updated database interface

## FileSystem Provider Behavior

When using the FileSystem provider:

- **Read CVs**: Reads from `public/samples/CVs/*.json`
- **Save/Update CVs**: Saves to `public/samples/user_cvs/*.json` to avoid modifying samples
- **CV Info**: Reads/writes `public/samples/cv_info.json`
- **Annotations**: Saves to `public/samples/annotations.json`

## MongoDB Provider Behavior

When using the MongoDB provider:
- Connects to the database specified in `MONGODB_URI`
- Uses collections: `cvs`, `cv_info`, `annotations`
- Maintains the same behavior as the original implementation

## Testing

To test the provider switching:

1. Check current provider: `GET /api/test-provider`
2. Switch between providers by changing `NEXT_PUBLIC_USE_BACKEND` in `.env`
3. Restart the application to pick up the new environment variable

## Migration

The existing API routes have been updated to use the new provider system while maintaining backward compatibility.
