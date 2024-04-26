import I18nServer from '../src/server'
import I18nClient from '../src/client'
import { WaitingJsonDb } from './db'

// This is for test purpose: in general usage, only one locale/T is used
let server: I18nServer,
	T: Record<string, any>,
	locales: Record<string, I18nClient>,
	loads: any[] = []

beforeAll(async () => {
	server = new I18nServer(
		new WaitingJsonDb({
			'fld.name': { en: 'Name', fr: 'Nom', '.zone': '' },
			'fld.bdate': { en: 'Birthday', fr: 'Date de naissance', '.zone': '' },
			'fld.bdate.short': { en: 'B-dy', '.zone': '' },
			'msg.greet': {
				en: 'Hello {=1|here}',
				fr: 'Salut {=1|tout le monde}',
				'fr-BE': "Salut {=1|m'fi}",
				'.zone': ''
			},
			'cmd.ban': { en: 'Ban user', fr: "Bannir l'utilisateur", '.zone': 'adm' },
			'specs.animal': {
				en: '{=1} {plural|$1|ox|oxen}',
				fr: '{=1} {plural|$1|one: cheval, other: chevaux}',
				'.zone': ''
			},
			'specs.ordinal': { '': '{ordinal|$1}', '.zone': '' },
			'format.number': { '': '{number|$1}', '.zone': '' },
			'format.number.engineering': { '': '{number|$1|engineering}', '.zone': '' },
			'format.price': { '': '{number|$2|style: currency, currency: $1}', '.zone': '' },
			'format.dateTime': { '': '{date|$1}', '.zone': '' },
			'format.medium': { '': '{date|$1|dateStyle: medium}', '.zone': '' },
			'format.date': { '': '{date|$1|date}', '.zone': '' },
			'format.time': { '': '{date|$1|time}', '.zone': '' },
			'format.relative': { '': '{relative|$1|short}', '.zone': '' },
			'format.region': { '': '{region|$1}', '.zone': '' },
			'format.language': { '': '{language|$1}', '.zone': '' },
			'format.script': { '': '{script|$1}', '.zone': '' },
			'format.currency': { '': '{currency|$1}', '.zone': '' },
			'msg.entries': {
				en: 'There are {number|$1} {plural|$1|entry|entries}',
				fr: 'Il y a {number|$1} {plural|$1|entrée}',
				'.zone': ''
			},
			'cnv.naming': {
				fr: '{=first} {=last}',
				en: '{=last}, {=first}',
				'.zone': ''
			},
			'cnv.subNaming': {
				// Useful to test parameters management
				en: '{cnv.naming | first: $first, last: $last}',
				fr: '{cnv.naming | $}',
				'.zone': ''
			},
			'internals.ordinals': {
				en: "{one: '$st', two: '$nd', few: '$rd', other: '$th'}",
				fr: "{one: '$er', other: '$ème'}",
				'.zone': ''
			},
			'internals.plurals': {
				en: "{one: '$', other: '$s'}",
				fr: "{one: '$', other: '$s'}",
				'.zone': ''
			}
		})
	)

	function condense(locale: GenI18n.LocaleName, zones: string[] = ['']) {
		loads.push({ locale, zones })
		return server.condense(locale, zones)
	}
	locales = { en: new I18nClient('en-US', condense), be: new I18nClient('fr-BE', condense) }
	locales.en.enter('adm')
	locales.be.timeZone = 'Europe/Brussels'
	await Promise.all(Object.values(locales).map((client) => client.loaded))
	T = Object.fromEntries(Object.entries(locales).map(([key, value]) => [key, value.enter()]))
})

describe('basic functionalities', () => {
	test('several kind of text access', () => {
		const fields = T.en.fld
		expect('' + fields.name).toBe('Name')
		expect('' + fields.name.short).toBe('Name')
		expect('' + fields.bdate).toBe('Birthday')
		expect('' + fields.bdate.short).toBe('B-dy')
		expect(fields.name()).toBe('Name')
		expect('' + fields['name']).toBe('Name')
		expect(T.en['fld.name']()).toBe('Name')
	})

	test('simple arguments', () => {
		expect(T.en.msg.greet()).toBe('Hello here')
		expect(T.en.msg.greet('world')).toBe('Hello world')
		expect(T.be.msg.greet()).toBe("Salut m'fi")
		expect(T.be.msg.greet('tout le monde')).toBe('Salut tout le monde')
		expect(T.en.cnv.subNaming({ first: 'John', last: 'Doe' })).toBe('Doe, John')
		expect(T.be.cnv.subNaming({ first: 'John', last: 'Doe' })).toBe('John Doe')
	})

	test('dialect management', () => {
		expect(T.be.msg.greet()).toBe("Salut m'fi")
		expect(T.be.fld.name()).toBe('Nom')
	})
})
describe('numbers', () => {
	test('plurals', () => {
		expect(T.en.specs.animal(1)).toBe('1 ox')
		expect(T.en.specs.animal(2)).toBe('2 oxen')
		expect(T.be.specs.animal(1)).toBe('1 cheval')
		expect(T.be.specs.animal(2)).toBe('2 chevaux')

		expect(T.en.msg.entries(1)).toBe('There are 1 entry')
		expect(T.en.msg.entries(2)).toBe('There are 2 entries')
		expect(T.be.msg.entries(1)).toBe('Il y a 1 entrée')
		expect(T.be.msg.entries(2)).toBe('Il y a 2 entrées')
	})

	test('ordinals', () => {
		expect(T.en.specs.ordinal(1)).toBe('1st')
		expect(T.en.specs.ordinal(2)).toBe('2nd')
		expect(T.en.specs.ordinal(3)).toBe('3rd')
		expect(T.en.specs.ordinal(4)).toBe('4th')
		expect(T.en.specs.ordinal(11)).toBe('11th')
		expect(T.en.specs.ordinal(12)).toBe('12th')
		expect(T.en.specs.ordinal(13)).toBe('13th')
		expect(T.en.specs.ordinal(14)).toBe('14th')
		expect(T.en.specs.ordinal(21)).toBe('21st')
		expect(T.en.specs.ordinal(22)).toBe('22nd')
		expect(T.en.specs.ordinal(23)).toBe('23rd')
		expect(T.en.specs.ordinal(24)).toBe('24th')
		expect(T.en.specs.ordinal(111)).toBe('111th')
		expect(T.en.specs.ordinal(112)).toBe('112th')
		expect(T.en.specs.ordinal(113)).toBe('113th')
		expect(T.en.specs.ordinal(114)).toBe('114th')
		expect(T.en.specs.ordinal(121)).toBe('121st')
		expect(T.en.specs.ordinal(122)).toBe('122nd')
		expect(T.en.specs.ordinal(123)).toBe('123rd')
		expect(T.en.specs.ordinal(124)).toBe('124th')

		expect(T.be.specs.ordinal(1)).toBe('1er')
		expect(T.be.specs.ordinal(2)).toBe('2ème')
		expect(T.be.specs.ordinal(3)).toBe('3ème')
		expect(T.be.specs.ordinal(4)).toBe('4ème')
		expect(T.be.specs.ordinal(11)).toBe('11ème')
		expect(T.be.specs.ordinal(12)).toBe('12ème')
	})
})
describe('formatting', () => {
	test('numbers', () => {
		// Warning: direct strings fail as the "space" used is some kind of special "&nbsp;" or sth
		const big = 123456789.123456789,
			price = 6752.52
		expect(T.en.format.number(big)).toBe(big.toLocaleString('en-US'))
		expect(T.en.format.number.engineering(big)).toBe(
			big.toLocaleString('en-US', { notation: 'engineering' })
		)
		expect(T.en.format.price('USD', price)).toBe(
			price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
		)
		expect(T.be.format.number(big)).toBe(big.toLocaleString('fr-BE'))
		expect(T.be.format.price('EUR', price)).toBe(
			price.toLocaleString('fr-BE', { style: 'currency', currency: 'EUR' })
		)
	})

	test('dates', () => {
		const date = new Date('2021-05-01T12:34:56.789Z')
		expect(T.en.format.date(date)).toBe('5/1/21')
		expect(T.be.format.date(date)).toBe('1/05/21')
		expect(T.en.format.dateTime(date)).toBe('5/1/2021, 3:34:56 PM')
		expect(T.be.format.dateTime(date)).toBe('01/05/2021 14:34:56')
		expect(T.en.format.medium(date)).toBe('May 1, 2021')
		expect(T.be.format.medium(date)).toBe('1 mai 2021')
		expect(T.en.format.time(date)).toBe('3:34 PM')
		expect(T.be.format.time(date)).toBe('14:34')
	})
	test('relative', () => {
		expect(T.en.format.relative('-1 month')).toBe('1 month ago')
		expect(T.be.format.relative('2 seconds')).toBe('dans 2 secondes')
	})
	test('display names', () => {
		expect(T.en.format.region('HU')).toBe('Hungary')
		expect(T.be.format.region('US')).toBe('États-Unis')
		expect(T.en.format.language('en-UK')).toBe('British English')
		expect(T.be.format.language('fr-CA')).toBe('français canadien')
		expect(T.en.format.script('Latn')).toBe('Latin')
		expect(T.be.format.script('Latn')).toBe('latin')
		expect(T.en.format.currency('RON')).toBe('Romanian Leu')
		expect(T.be.format.currency('HUF')).toBe('forint hongrois')
	})
})
describe('parameters', () => {
	test('zones', async () => {
		expect(loads).toEqual([
			{ locale: 'fr-BE', zones: [''] },
			{ locale: 'en-US', zones: ['', 'adm'] }
		])
		expect(T.en.cmd.ban()).toBe('Ban user')
		expect(T.be.cmd.ban()).toBe('[cmd.ban]')
		loads = []
		locales.be.enter('adm')
		await locales.be.loaded
		expect(loads).toEqual([{ locale: 'fr-BE', zones: ['adm'] }])
		expect(T.be.cmd.ban()).toBe("Bannir l'utilisateur")
	})

	test('change locale', async () => {
		const client = new I18nClient('en-US', server.condense),
			T = client.enter()
		await client.loaded
		expect(T.msg.greet()).toBe('Hello here')
		await client.setLocale('fr')
		expect(T.msg.greet()).toBe('Salut tout le monde')
	})
})
