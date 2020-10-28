// index db key-value only store
// direct access via getters/setters
// DB.heinz = {nachname:'walter'}
// log(DB.heinz.nachname)
// 
// class IDBKV{
// 	constructor(){
// 		let REQ = window.indexedDB.open('IDBKV', 1);
// 		REQ.onsuccess = event => {
// 			this.DB = event.target.result
// 			f(DB)
// 		}
// 		REQ.onupgradeneeded = event => {
// 			this.DB = event.target.result
// 			this.DB.createObjectStore('store');
// 			event.target.transaction.oncomplete = e => f(DB);
// 		}
// 	}
// }

let DB = null;
const IDB = () => new Promise((resolve, reject) => {
	if (DB) return resolve(DB);
	// let STORE = null;
	let REQ = window.indexedDB.open('IDBKV', 1);
	REQ.onsuccess = event => {
		DB = event.target.result
		resolve(DB)
	}
	REQ.onupgradeneeded = event => {
		DB = event.target.result
		DB.createObjectStore('store');
		event.target.transaction.oncomplete = e => resolve(DB);
	}
})



let OS = DB => DB.transaction(['store'], "readwrite").objectStore('store')

let save = (DB, key, val) => OS(DB).put(val, key)

let keys = DB => new Promise((resolve, reject) => {
	OS(DB).getAllKeys().onsuccess = async function (event) {
		resolve(event.target.result);
	};
});

let load = (DB, key) => new Promise((resolve, reject) => {
	OS(DB).get(key).onsuccess = function (event) {
		resolve(event.target.result);
	};
});

export default new Proxy({}, {
	set: (target, key, value) => {
		switch (key) {
			default: return IDB().then(DB => save(DB, key, value))
		}
	},
	get: (target, key) => {
		switch (key) {
			case 'keys': return IDB().then(DB => keys(DB))
			default: return IDB().then(DB => load(DB, key))
		}
	}
})


// export default IDB.then(DB => new Promise(async (resolve, reject) => {
// 	// console.log("IDBKV ready", DB)
// 	let all = await loadAll(DB, 'store')
// 	// console.log('IDBKV data', all);
// 	// for (let key in all)
// 	// 	DATA[key] = all[key];
// 	let DATA = new Proxy(all, {
// 		set: (target, key, value) => {
// 			let out = Reflect.set(target, key, value);
// 			if (typeof value != 'function')
// 				// OS(DB, 'store').put(value, key)
// 				DATA.save(key);
// 			// save(DB, 'store', key, value);
// 			return out;
// 		},
// 	})
// 	DATA.keys = () => Object.entries(DATA).filter(x => typeof x[1] != 'function').map(x => x[0])
// 	DATA.save = key => OS(DB, 'store').put(DATA[key], key)
// 	DATA.saveAll = () => DATA.keys().map(DATA.save)
// 	DATA.delete = key => { OS(DB, 'store').delete(key); delete DATA[key]; }
// 	DATA.clear = () => DATA.keys().map(DATA.delete)

// 	resolve(DATA);
// }));









