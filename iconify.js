//
// Loads Iconify icons into <img data-iconify="prefix:name"> elements.
// Icons are fetched in one JSON request per icon set instead of one SVG request per icon,
// because api.iconify.design rate-limits bursts of single-SVG requests (HTTP 429).
// Loaded icons are cached in localStorage so repeat visits make no icon requests at all.
//
const IconifyImages = (() => {
  const API = "https://api.iconify.design"
  const CACHE_KEY = "iconifyCache:v1"
  const BATCH_SIZE = 60
  const idPattern = /^[a-z0-9-]+:[a-z0-9-]+$/i

  const cache = (() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {}
    } catch (_) {
      return {}
    }
  })()

  const saveCache = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch (_) {
      // Storage full or blocked; icons still load, just not cached.
    }
  }

  const isIconId = (value) => idPattern.test(String(value ?? "").trim())

  // Iconify serves "prefix/name.svg"; the old "prefix:name.svg" form returns 404.
  const url = (iconId) => {
    const [prefix, name] = String(iconId).split(":")
    return `${API}/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg`
  }

  const toDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  // Builds an SVG from an icon set JSON response, following aliases to their parent icon.
  // Returns "" for aliases that rotate or flip, which fall back to the single-SVG URL.
  const buildSvg = (data, name) => {
    let width
    let height
    const seen = new Set()
    while (!data.icons?.[name] && data.aliases?.[name] && !seen.has(name)) {
      const alias = data.aliases[name]
      if (alias.rotate || alias.hFlip || alias.vFlip) return ""
      seen.add(name)
      width ??= alias.width
      height ??= alias.height
      name = alias.parent
    }
    const icon = data.icons?.[name]
    if (!icon || icon.rotate || icon.hFlip || icon.vFlip) return ""
    const left = icon.left ?? data.left ?? 0
    const top = icon.top ?? data.top ?? 0
    width ??= icon.width ?? data.width ?? 16
    height ??= icon.height ?? data.height ?? 16
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${left} ${top} ${width} ${height}">${icon.body}</svg>`
  }

  const fetchBatch = async (prefix, names) => {
    const response = await fetch(`${API}/${encodeURIComponent(prefix)}.json?icons=${names.map(encodeURIComponent).join(",")}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    names.forEach((name) => {
      const svg = buildSvg(data, name)
      if (svg) cache[`${prefix}:${name}`] = toDataUri(svg)
    })
  }

  // Fills every <img data-iconify> under root that has no src yet.
  const load = async (root = document) => {
    const images = Array.from(root.querySelectorAll("img[data-iconify]:not([src])"))
    const apply = () =>
      images.forEach((img) => {
        const src = cache[img.dataset.iconify]
        if (src) img.src = src
      })
    apply()

    const namesByPrefix = new Map()
    images
      .map((img) => img.dataset.iconify)
      .filter((id) => isIconId(id) && !cache[id])
      .forEach((id) => {
        const [prefix, name] = id.split(":")
        if (!namesByPrefix.has(prefix)) namesByPrefix.set(prefix, new Set())
        namesByPrefix.get(prefix).add(name)
      })
    if (!namesByPrefix.size) return

    const batches = []
    namesByPrefix.forEach((names, prefix) => {
      const list = Array.from(names)
      for (let i = 0; i < list.length; i += BATCH_SIZE) {
        batches.push(fetchBatch(prefix, list.slice(i, i + BATCH_SIZE)).catch(() => {}))
      }
    })
    await Promise.all(batches)
    saveCache()
    apply()

    // Anything the batch could not build (missing icon, transformed alias, failed request)
    // falls back to the single-SVG URL.
    images.forEach((img) => {
      if (!img.getAttribute("src") && isIconId(img.dataset.iconify)) img.src = url(img.dataset.iconify)
    })
  }

  return { isIconId, url, load }
})()
