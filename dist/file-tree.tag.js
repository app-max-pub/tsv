console.log('file-tree', import.meta.url);
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
	ul {
		margin: 0;
	}
	:host,
	* {
		outline: none;
		font-family: Helvetica, sans-serif;
	}
	.folder,
	li {
		list-style-type: none;
		margin-left: -20px;
	}
	.extension::before {
		content: "."
	}
	.extension {
		color: gray;
		display: none;
	}
	.icon {
		text-transform: uppercase;
		font-weight: bold;
		color: silver;
		font-size: 8px;
		margin-right: 5px;
	}
	.file:hover {
		color: lime;
		cursor: pointer;
	}`));
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
import FS from '../fs.js';
	class file_tree extends WebTag {
		$onReady() {
			this.$view.addEventListener('click', event => {
				let li = event.target.closest('li');
				let number = li.getAttribute('number');
				let handle = this.list[number - 1];
				if (!handle) return;
				console.log('handle', handle)
				this.$event('file', handle)
			})
		}
		set folder(folder) {
			this.list = [];
			this.render(folder).then(x => this.$view = x);
		}
		fileName(name) {
			return `<span class='icon'>${name.split('.').slice(-1)[0]}</span><span class='name'>${name.split('.').slice(0, -1).join('.')}</span><span class='extension'>${name.split('.').slice(-1)[0]}</span>`;
		}
		async render(handle) {
			let folder = await FS.loadFolder(handle);
			let htm = `<details open>`;
			htm += `<summary>${handle.name}</summary>`;
			htm += `<ul>`;
			for (let item of folder) {
				if (item.name == '.git') continue;
				this.list.push(item);
				if (item.kind == 'file')
					if (item.name.endsWith('.tsv'))
						htm += `<li class='file' number='${this.list.length}'>${this.fileName(item.name)}</li>`
				if (item.kind == 'directory')
					htm += `<li class='folder'>${await this.render(item)}</li>`;
			}
			htm += `</ul>`;
			htm += `</details>`;
			return htm;
		}
	}
window.customElements.define('file-tree', file_tree)