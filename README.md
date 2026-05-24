## On-device cache library

- optimistic caching
- abstraction to hide impl. details, e.g., localStorage/sessionSotrage/indexDb etc.
configurable
- FE & BE contract i.e. standard

<bold>usage:</bold>
```ts
devi.cache(key, payload, options)
devi.get(key)
devi.getThenRefresh(key, options)
devi.del(key)
devi.conf(key, options)
```

<bold>streaming:</bold>
```ts
// TODO
```

supported
- browsers (mobile/desktop)
    - chromium
    - safari
    - firefox
- devices
    - tbd

oss, githubdevice cache library
