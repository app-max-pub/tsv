// index db key-value only store
// direct access via getters/setters
// DB.heinz = {nachname:'walter'}
// log(DB.heinz.nachname)
// 

let REQ = window.indexedDB.open('IDBKV', 1);

const IDB = new Promise((resolve, reject) => {
	// let STORE = null;
	REQ.onsuccess = event => {
		// console.log('DB.ready');
		// DB = event.target.result;
		resolve(event.target.result)
	}
	REQ.onupgradeneeded = event => {
		// console.log('DB.upgrade');
		DB = event.target.result;
		DB.createObjectStore('store');
		event.target.transaction.oncomplete = e => resolve(DB);
	}
})


let OS = (DB) => DB.transaction(['store'], "readwrite").objectStore('store')

let save = (DB, key, val) => OS(DB).put(val, key)

let loadAll = async DB => new Promise((resolve, reject) => {
	OS(DB).getAllKeys().onsuccess = async function (event) {
		let out = {};
		for (let key of event.target.result)
			out[key] = await load(DB, key);
		resolve(out);
	};
});

let load = (DB, key) => new Promise((resolve, reject) => {
	OS(DB).get(key).onsuccess = function (event) {
		resolve(event.target.result);
	};
});



export default IDB.then(DB => new Promise(async (resolve, reject) => {
	// console.log("IDBKV ready", DB)
	let all = await loadAll(DB, 'store')
	// console.log('IDBKV data', all);
	// for (let key in all)
	// 	DATA[key] = all[key];
	let DATA = new Proxy(all, {
		set: (target, key, value) => {
			let out = Reflect.set(target, key, value);
			if (typeof value != 'function')
				// OS(DB, 'store').put(value, key)
				DATA.save(key);
			// save(DB, 'store', key, value);
			return out;
		},
	})
	DATA.keys = () => Object.entries(DATA).filter(x => typeof x[1] != 'function').map(x => x[0])
	DATA.save = key => OS(DB, 'store').put(DATA[key], key)
	DATA.saveAll = () => DATA.keys().map(DATA.save)
	DATA.delete = key => { OS(DB, 'store').delete(key); delete DATA[key]; }
	DATA.clear = () =>DATA.keys().map(DATA.delete)

	resolve(DATA);
}));















// function save() {
// 	// if (!UPDATES) return;
// 	// var transaction = DB.transaction(["store"], "readwrite");
// 	// // Do something when all the data is added to the database.
// 	// transaction.oncomplete = function (event) {
// 	// 	console.log("IDBKV data saved");
// 	// };

// 	// transaction.onerror = function (event) {
// 	// 	console.error("IDBKV transaction error", event)
// 	// 	// Don't forget to handle errors!
// 	// };

// 	// var objectStore = transaction.objectStore("store");

// 	// console.log('export',DATA.export())

// 	let store = DB.transaction(["store"], "readwrite").objectStore("store");

// 	for (let key in DATA) {
// 		// let val = JSON.parse(JSON.stringify(DATA[key]))
// 		let val = DATA[key];
// 		console.log('save', key, DATA[key],val)
// 		// var request = objectStore.add(DATA[key]);
// 		var request = store.put(val,key);
// 		request.onsuccess = function (event) {
// 			console.log('save suc', event)
// 			// event.target.result === customer.ssn;
// 		};
// 	}
// 	UPDATES = false;
// }
// setInterval(save, 100);


// let UPDATES = false;
// function watch(o = {}) {
// 	return new Proxy(o, {
// 		set: (target, key, value) => {
// 			console.log('set', target, key, value)
// 			UPDATES = true;
// 			if (typeof value == 'object')
// 				value = watch(value);
// 			return Reflect.set(target, key, value);
// 		},
// 	})
// }

// let DATA = watch({})











// function save(key) {
// 	DB.transaction(["store"], "readwrite").objectStore("store").put(DATA[key], key);
// }
// let DATA = new Proxy({}, {
// 	set: (target, key, value) => {
// 		return Reflect.set(target, key, value);
// 		// save(key);
// 	},
// })
// DATA.save = function (key) {
// 	console.log("SAVE",key)
// 	if (key)
// 		save(key)
// 	else
// 		for (let key in DATA)
// 			save(key)
// }

// export default DATA;


// //[ ATTR
// function ATTR() {  // attributes
// 	return new Proxy(
// 		Object.fromEntries(Array.from(this.attributes).map(x => [x.nodeName, x.nodeValue])),
// 		{
// 			set: (target, key, value) => {
// 				// console.log('SET', target, '.', key, '.', value);
// 				if (this.getAttribute(key) != value)
// 					this.setAttribute(key, value);
// 				return Reflect.set(target, key, value);
// 			}
// 		}
// 	)
// }
// Object.defineProperty(Element.prototype, "A", { get: ATTR, configurable:true });
// Object.defineProperty(DocumentFragment.prototype, "A", { get: ATTR, configurable:true });
// // Element.prototype.A = ATTR
// // DocumentFragment.prototype.A = ATTR
// //] ATTR





// class DB {

// 	constructor(name, version) {
// 		this.upgradeInfo = {};
// 		this.openDB(name, version);
// 	}

// 	openDB(name = 'IDBKV', version = 1) {
// 		this.name = name;
// 		this.version = version;
// 		if (this.db) this.db.close();
// 		let request = window.indexedDB.open('IDBKV', 1);

// 		request.onerror = event => {
// 			console.log('DB.error', event.target.error.message);
// 			let currentVersion = event.target.error.message.match(/([0-9]+)/g).slice(-1);
// 			if (event.target.error.name == 'VersionError')
// 				if (currentVersion) this.openDB(name, currentVersion);
// 				else this.openDB(name, ++version);
// 		}

// 		request.onsuccess = event => {
// 			this.db = event.target.result;
// 			console.log('DB.ready', 'v' + this.version);
// 			let stores = this.db.objectStoreNames;
// 			for (let i = 0; i < stores.length; i++)
// 				// if (!this[stores[i]])
// 				this[stores[i]] = new DBstore(this.db, stores[i]);
// 		}

// 		request.onupgradeneeded = event => {
// 			console.log('DB.upgrade');
// 			let db = event.target.result;
// 			for (let name in this.upgradeInfo) {
// 				let conf = this.upgradeInfo[name];
// 				delete this.upgradeInfo[name];

// 				try {
// 					var store = event.target.transaction.objectStore(name);
// 				} catch (e) {
// 					console.log('DB.createStore', name, conf.store);
// 					var store = db.createObjectStore(name, conf.store);
// 				}

// 				conf.indices.forEach((ic, index) => {
// 					try {
// 						console.log('DB.createIndex', index, ic);
// 						store.createIndex(index, index, ic);
// 					} catch (e) { }
// 				});
// 			}
// 		};
// 	}

// 	addStore(name, key, indices) {
// 		if (!this.db.objectStoreNames.contains(name)) return this._addStore(name, key, indices);
// 		let store = this.db.transaction([name]).objectStore(name);
// 		for (let index of indices) {
// 			if (index[0] == '!') index = index.slice(1);
// 			if (!store.indexNames.contains(index))
// 				return this._addStore(name, key, indices);
// 		}
// 		console.log('DB.addStore', name, '... store and indices already added');
// 	}

// 	_addStore(name, key, indices) {
// 		let conf = {
// 			store: {},
// 			indices: new Map()
// 		};
// 		if (typeof key == 'number') conf.store.autoIncrement = true;
// 		if (typeof key == 'string') conf.store.keyPath = key;
// 		if (typeof key == 'object') conf.store = key;

// 		for (let index of indices)
// 			if (index[0] == '!')
// 				conf.indices.set(index.slice(1), {
// 					unique: true
// 				});
// 			else
// 				conf.indices.set(index, {
// 					unique: false
// 				});
// 		this.upgradeInfo[name] = conf;
// 		this.openDB(this.name, ++this.version);
// 		return this;
// 	}

// 	// static logEvent(name, request) {
// 	// 	req.onsuccess = event => console.log(name, event, request);
// 	// 	req.onerror = event => console.error(name, event, request);
// 	// }
// }



// class DBstore {
// 	constructor(db, name) {
// 		// console.log('new DBstore', name);
// 		this.db = db;
// 		this.name = name;
// 	}
// 	access(type, callback) {
// 		return this.db.transaction([this.name], "readwrite").objectStore(this.name);
// 	}
// 	query(index, filter) {
// 		if (filter.length == 1) var bounds = IDBKeyRange.only(filter[0]);
// 		else if (!filter[0]) var bounds = IDBKeyRange.upperBound(filter[1]);
// 		else if (!filter[1]) var bounds = IDBKeyRange.lowerBound(filter[0]);
// 		else var bounds = IDBKeyRange.bound(filter[0], filter[1]);
// 		return new DBcursor(this.write().index(index).openCursor(bounds));
// 	}
// 	get(index, key) {
// 		if (key)
// 			var tx = this.write().index(index).get(key)
// 		else
// 			var tx = this.write().get(index);
// 		return DBstore.promise(tx);
// 	}
// 	add(data) {
// 		this.access(tx => {
// 			tx.add(data);
// 		}, 'readwrite');
// 		return DBstore.promise(this.write().add(data));
// 	}
// 	put(data) {
// 		return DBstore.promise(this.write().put(data));
// 	}
// 	del(key) {
// 		return DBstore.promise(this.write().delete(data));
// 	}

// 	static promise(request) { // transform event-handlers into ES6-Promises
// 		return new Promise((resolve, reject) => {
// 			request.onsuccess = event => resolve(request.result);
// 			request.onerror = event => reject(event);
// 		});
// 	}
// }



// class DBcursor {
// 	constructor(tx) {
// 		var list = [];
// 		tx.onsuccess = event => {
// 			var cursor = event.target.result;
// 			if (cursor) {
// 				if (this.f1)
// 					this.f1(cursor.value);
// 				list.push(cursor.value);
// 				cursor.continue();
// 			} else {
// 				if (this.f2)
// 					this.f2(list);
// 			}
// 		};
// 	}
// 	forEach(callback) {
// 		this.f1 = callback;
// 		return this;
// 	}
// 	getAll(callback) {
// 		this.f2 = callback;
// 		return this;
// 	}
// 	saveTo(map) {

// 	}
// }



// this.write().index(index).openCursor(bounds).onsuccess = event => {
// 	var cursor = event.target.result;
// 	if (cursor) {
// 		if (callback)
// 			callback(cursor.value);
// 		// console.log("CURSOR", cursor.value);
// 		cursor.continue();
// 	}
// };


// return DBstore.promise(this.write().index(name).get(key));


// this.db.getObjectStore(name);
// this.read = this.db.transaction([name]).objectStore(name);
// this.write = this.db.transaction([name], "readwrite").objectStore(name);