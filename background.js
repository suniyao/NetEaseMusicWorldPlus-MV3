const defaultMode = 2
const title = ['closed', 'normal', 'enhanced']
const icon = ['images/grey16.png', 'images/red16.png', 'images/blue16.png']

const getMode = async () => {
	const { mode } = await chrome.storage.local.get('mode')
	return Number.isInteger(mode) && mode >= 0 && mode < title.length ? mode : defaultMode
}

const updateRules = async mode => {
	const rules = await (await fetch(chrome.runtime.getURL('rules.json'))).json()
	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: rules.map(rule => rule.id),
		addRules: mode > 0 ? rules : []
	})
}

const sync = async mode => {
	await updateRules(mode)
	await Promise.all([
		chrome.storage.local.set({ mode }),
		chrome.action.setIcon({ path: icon[mode] }),
		chrome.action.setTitle({ title: `${chrome.i18n.getMessage('name')} [${chrome.i18n.getMessage(title[mode])}]` })
	])
}

let pendingOperation = Promise.resolve()

const enqueue = operation => {
	pendingOperation = pendingOperation
		.then(operation, operation)
		.catch(error => console.error('Failed to update extension state:', error))
}

chrome.action.onClicked.addListener(() => {
	enqueue(async () => {
		const mode = await getMode()
		await sync((mode + 1) % title.length)
	})
})

const restore = () => enqueue(async () => sync(await getMode()))

chrome.runtime.onInstalled.addListener(restore)
chrome.runtime.onStartup.addListener(restore)
