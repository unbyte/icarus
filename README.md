# Icarus

🚧 WIP

## ./config.json schema

```typescript
{
  webhook: string
  // signature key
  key: string

  // log file path
  logfile?: string

  // is debug mode
  debug?: boolean

  // interval unit: minute
  interval?: {
    min?: number
    max?: number
  }
}
```