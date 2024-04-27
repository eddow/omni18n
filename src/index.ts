export {
	default as I18nClient,
	Internals,
	TContext,
	Translator,
	formats,
	processors,
	reports,
	globals
} from './client'
export { default as I18nServer, InteractiveServer, DB, InteractiveDB } from './server'
export { default as JsonDB, JsonDictionary, JsonDictionaryEntry } from './json-db'

declare global {
	interface Set<T> {
		union(...sets: Set<T>[]): this
	}
}
