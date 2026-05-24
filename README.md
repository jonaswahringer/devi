# On-device cache library

- optimistic caching
- abstraction to hide impl. details, e.g., localStorage/sessionSotrage/indexDb etc.
- FE & BE contract i.e. standard

## Usage
```ts
devi.cache(key, payload, options)
devi.get(key)
devi.getThenRefresh(key, options)
devi.del(key)
devi.conf(key, options)
```

## Streaming
```ts
// TODO
```

## Supported
- browsers (mobile/desktop)
    - chromium
    - ~~safari~~ 
    - ~~firefox~~
- devices
    - all of which have access to a filesystem ^^
  
––––––––––––––
wahringer – oss
