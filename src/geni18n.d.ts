declare namespace GenI18n {
	interface CondensedDictionary {
		[key: string]: CondensedDictionary | string
	}

	type RawDictionary = Record<string, string>

	// shortcut
	type LocaleName = Intl.UnicodeBCP47LocaleIdentifier

	type Zone = string
}
