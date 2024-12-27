/**
 * {
 *     "path": {
 *         "to": 'My name is {{firstName}}',
 *     }
 * }
 * <Trans key='path.to?firstName=John'> => 'My name is John'
 */
import { ModuleType } from 'i18next';
import { TOptions } from 'i18next';

const PLUGIN_NAME = 'i18next-query-string';

/**
 * @param i18nKey {string} - 'path.to?firstName=John'
 * @returns {{}|*} - { firstName: 'John' }
 */
function getQueryParams(i18nKey: string): TOptions {
    // Get the query string after the last "?"
    const splitUrl = i18nKey.split('?');
    const queryString = splitUrl[splitUrl.length - 1];
    if (!queryString) return {};

    return queryString.split('&').reduce((params, param) => {
        const [key, value] = param.split('=');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        params[key] = decodeURIComponent(value);
        return params;
    }, {});
}

/**
 * @param i18nKey {string} - 'path.to?firstName=John'
 * @returns {string} - 'path.to'
 */
function getOriginalKey(i18nKey: string): string {
    // Delete the query string after the last "?"
    const splitUrl = i18nKey.split('?');
    if (splitUrl.length > 1) {
        splitUrl.pop();
    }
    return splitUrl.join('?');
}

/**
 * @param options {TOptions}
 * @returns {TOptions}
 */
function deletePreviousPostProcess(options: TOptions): TOptions {
    if (typeof options.postProcess === 'string') {
        delete options.postProcess;
    } else if (Array.isArray(options.postProcess)) {
        const index = options.postProcess.indexOf(PLUGIN_NAME); // <-- Not supported in <IE9
        if (index !== -1) options.postProcess.splice(index, 1);
    }

    return options;
}

function processQueriesKeys(keys: string | string[], options: TOptions) {
    let newKeys: string | string[] = typeof keys === 'string' ? keys : [...keys];
    let newOptions: TOptions = { ...{}, ...options };

    if (typeof keys === 'string') {
        const query = getQueryParams(keys) ?? ({} as TOptions);
        options = { ...options, ...query };

        newKeys = getOriginalKey(keys);
    } else if (Array.isArray(keys)) {
        newKeys = [];
        keys.forEach((k) => {
            const query = getQueryParams(k) ?? ({} as TOptions);
            newOptions = { ...options, ...query };
            const originalKey = getOriginalKey(k);
            (newKeys as string[]).push(originalKey);
        });
    }
    return { newKeys, newOptions };
}

const I18nextQueryString = {
    name: PLUGIN_NAME,
    type: 'postProcessor' as ModuleType,

    process: function (
        value: string,
        key: string | string[],
        options: TOptions,
        translator: { translate: (arg0: string | string[], arg1: TOptions) => unknown }
    ) {
        // Key not contains '?' => return value
        if (
            (typeof key === 'string' && !key.includes('?')) ||
            (typeof key === 'object' && key.every((k) => !k.includes('?')))
        ) {
            return value;
        }

        let _option: TOptions = { ...{}, ...options };
        _option = deletePreviousPostProcess(_option);

        const { newKeys, newOptions } = processQueriesKeys(key, _option);

        return translator.translate(newKeys, newOptions) ?? value;
    }
};

export default I18nextQueryString;
