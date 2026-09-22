// https://stackoverflow.com/questions/9263671/google-chrome-application-shortcut-how-to-auto-load-javascript/9310273#9310273
// https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script/9517879#9517879

const modeEvent = 'NetEaseMusicWorldPlusMode'

const setPageMode = mode => {
	window.dispatchEvent(new CustomEvent(modeEvent, { detail: mode }))
}

const inject = mode => {
	const script = document.createElement('script')
	script.src = chrome.runtime.getURL('inject.js')
	script.dataset.mode = mode
	script.onload = () => script.parentNode.removeChild(script)
	;(document.head || document.documentElement).appendChild(script)
}

chrome.storage.local.get('mode', data => {
	const mode = data.mode == null ? 2 : data.mode
	inject(mode)
})

chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName == 'local' && changes.mode) setPageMode(changes.mode.newValue)
})
