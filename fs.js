export async function loadFolder(folder) {
	// console.log('load folder', folder);
	let list = [];
	for await (const entry of folder.values()) {
		list.push(entry);
		// if (entry.kind == 'file')
		// 	list[entry.name] = entry;
		// if (entry.kind == 'directory')
		// 	list[entry.name] = await loadFolder(entry)
	}
	return list;
}
export async function loadFile(fileHandle) {
	const file = await fileHandle.getFile();
	return await file.text();
}
export async function saveFile(fileHandle, contents) {
	// Create a FileSystemWritableFileStream to write to.
	const writable = await fileHandle.createWritable();
	// Write the contents of the file to the stream.
	await writable.write(contents);
	// Close the file and write the contents to disk.
	await writable.close();
}

export default {
	loadFolder,
	loadFile,
	saveFile,
}