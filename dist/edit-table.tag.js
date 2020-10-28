console.log('edit-table', import.meta.url);
function NODE(name, attributes = {}, children = []) {
	let node = document.createElement(name);
	for (let key in attributes)
		node.setAttribute(key, attributes[key]);
	for (let child of children)
		node.appendChild(typeof child == 'string' ? document.createTextNode(child) : child);
	return node;
}
class XML {
	static parse(string, type = 'xml') {
		return new DOMParser().parseFromString(string.replace(/xmlns=".*?"/g, ''), 'text/' + type)
	}
	static stringify(DOM) {
		return new XMLSerializer().serializeToString(DOM).replace(/xmlns=".*?"/g, '')
	}
}
XMLDocument.prototype.stringify = XML.stringify
Element.prototype.stringify = XML.stringify
const HTML = document.createElement('template');
HTML.innerHTML = ``;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: block;
	}
	* {
		font-family: 'Courier New', Courier, monospace;
	}
	:host,
	table {
		outline: none;
		border: none;
	}
	table {
		border-collapse: collapse;
	}
	td {
		border: 1px solid silver;
		padding: 3px;
	}
	td:hover {
		background: #eee;
		cursor: pointer;
	}`));
function QQ(query, i) {
	let result = Array.from(this.querySelectorAll(query));
	return i ? result?.[i - 1] : result;
}
Element.prototype.Q = QQ
ShadowRoot.prototype.Q = QQ
DocumentFragment.prototype.Q = QQ
class WebTag extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
	}
	async connectedCallback() {
		this.$applyHTML(); //: HTML
		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onReady(); //: onReady
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
			} else {
				this.$onDataChange(events); //: $onDataChange
			}
		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
	}
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				let action = target.closest(`[${key}]`);
				this[action.getAttribute(key)](action, event, target)
			}
			catch { }
		}
	}
	$applyHTML() {
		this.$view = HTML.content.cloneNode(true)
	}
	$clear(R) {
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}
	get $view() {
		return this.$HTM;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		if (typeof HTML == 'string')
			HTML = new DOMParser().parseFromString(HTML, 'text/html').firstChild
		this.$view.appendChild(HTML);
	}
	$event(name, options) {
		this.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: options
		}));
	}
};
class edit_table extends WebTag {
		$onReady() {
			this.$view.addEventListener('input', event => {
				console.log('change', event)
			})
			this.$view.addEventListener('focusout', event => {
				this.textContent = this.$view.Q('tr').map(tr => tr.Q('td').map(td => td.textContent).join('\t')).join('\n')
				this.$event('change', this.textContent)
			})
		}
		$onDataChange() {
			let tsv = this.textContent
			this.data = tsv.split('\n').filter(x => x.trim()).map(x => x.trim().split('\t'))
			let maxLen = Math.max(...this.data.map(x => x.length));
			this.data = this.data.map(x => [...x, ...Array(maxLen - x.length).fill('')])
			this.showData();
		}
		showData() {
			let htm = `<table contenteditable='true'>`;
			for (let row of this.data) {
				htm += `<tr>`;
				for (let cell of row) {
					htm += `<td>${cell}</td>`;
				}
				htm += `</tr>`;
			}
			htm += `</table>`;
			this.$view = htm;
		}
	}
window.customElements.define('edit-table', edit_table)