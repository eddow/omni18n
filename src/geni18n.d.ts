declare namespace Geni18n {

	interface CondensedDictionary {
		[key: string]: CondensedDictionary | string
	}

	type RawDictionary = Record<string, string>
}
