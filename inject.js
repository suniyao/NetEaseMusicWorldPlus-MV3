// https://stackoverflow.com/questions/18310484/modify-http-responses-from-a-chrome-extension/51594799#51594799

(() => {
	const modeEvent = 'NetEaseMusicWorldPlusMode'
	let mode = Number(document.currentScript.dataset.mode)

	window.addEventListener(modeEvent, event => {
		mode = event.detail
	})

	const _open = XMLHttpRequest.prototype.open
	window.XMLHttpRequest.prototype.open = function (_, url) {
		const requestUrl = String(url)
		this.addEventListener('readystatechange', () => {
			if (mode === 2 && this.readyState === 4 && this.status === 200 && requestUrl.includes('enhance/player/url')) {
				try {
					const data = JSON.parse(this.responseText)
					data.data.forEach(song =>
						song.url = song.url?.replace(/(m\d+?)(?!c)\.music\.126\.net/, '$1c.music.126.net')
					)
					Object.defineProperty(this, 'responseText', { value: JSON.stringify(data) })
				} catch (_) {}
			}
		})
		return _open.apply(this, arguments)
	}
})()
