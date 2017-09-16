/**
 * entry
 */
import * as  pathToRegExp from 'path-to-regexp'

const cache = new Map()

/**
 * Converts path to a regex, if a match is found then we extract params from it
 * @param routePattern 
 * @param url 
 * @param regOptions path-to-regexp options
 */
export function matchPath(routePattern, url, regOptions) {
    const [pathToMatch = '/', search = ''] = url.split('?')
    let regexp = cache.get(routePattern)

    if (!regexp) {
        const keys = []
        regexp = { pattern: pathToRegExp(routePattern, keys, regOptions), keys }
        cache.set(routePattern, regexp)
    }

    const m = regexp.pattern.exec(pathToMatch)

    if (!m) {
        return null
    }

    const path = m[0]
    const params = Object.create(null)

    for (let i = 1; i < m.length; i += 1) {
        params[regexp.keys[i - 1].name] = decodeURIComponent(m[i])
    }

    // Add querystring params
    Object.assign(params, mapSearchParams(search))

    return {
        path: path === '' ? '/' : path,
        params
    }
}

/**
 * Maps a querystring to an object
 * Supports arrays and utf-8 characters
 * @param search
 * @returns {any}
 */
export function mapSearchParams(search) {
    let params = {}
    let params_re = /([^?&=]+)=?([^&]*)/g

    if (search.indexOf('?') !== -1) {
        search = search.split('?')[1]
    }

    search.replace(params_re, function (m, name, value) {
        params[decodeURIComponent(name)] = decodeURIComponent(value)
    })

    return params
}
