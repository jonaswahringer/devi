## device cache library

devi-cache

- optimistic caching
- FE & BE contract i.e. standard
- abstraction to hide impl. details, e.g., localStorage/sessionSotrage/indexDb etc.
configurable

clean invocation:
```ts
devi.cache(key, payload, options)
devi.get(key)
devi.getThenRefresh(key, options)
devi.del(key)
devi.conf(key, options)
```

<bold>streaming</bold>

supported
- browsers (mobile/desktop)
    - chromium
    - safari
    - firefox
- devices
    - tbd

oss, githubdevice cache library
