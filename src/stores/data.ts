import type { Data, ExportedData, Save } from '@/types'
import { generateUuid } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDataStore = defineStore('data', () => {
	// Private
	const dataKey = 'VNexusData'
	const initializeSaves = (capacity: number) =>
		Array.from({ length: capacity }, (_, i) => ({
			id: i,
			uuid: generateUuid(),
			createTime: 0,
			updateTime: 0,
		}))
	const stripUndefined = <T>(arr: (T | undefined)[]) => {
		let i = arr.length - 1
		// Iterate backwards from the end of the array
		while (i >= 0 && arr[i] === undefined) {
			i--
		}
		// i now holds the index of the last non-undefined element (or -1 if all are undefined)
		// Return a new array with only the elements up to and including that index
		return arr.slice(0, i + 1)
	}
	const padUndefined = <T>(arr: (T | undefined)[], targetLength: number) => {
		const currentLength = arr.length
		if (currentLength >= targetLength) {
			return arr.slice() // Return a copy if already at or exceeds target length
		}
		const paddingNeeded = targetLength - currentLength
		const paddedArray = arr.slice() // Create a copy to avoid modifying the original
		for (let i = 0; i < paddingNeeded; i++) {
			paddedArray.push(undefined)
		}
		return paddedArray
	}
	const debugData = {
		capacity: 120,
		rows: 3,
		cols: 4,
		saves: initializeSaves(120),
	}
	// State
	const data = ref<Data>(debugData)
	const activeSaveId = ref<number>()
	// Getters
	const rows = computed(() => data.value.rows)
	const cols = computed(() => data.value.cols)
	const capacity = computed(() => data.value.capacity)
	const savesPerPage = computed(() => rows.value * cols.value)
	const totalPages = computed(() => Math.ceil(capacity.value / savesPerPage.value))
	const saves = computed(() => data.value.saves)
	const activeSave = computed(() => {
		if (activeSaveId.value === undefined) {
			return undefined
		}
		return saves.value[activeSaveId.value]
	})
	const baseSave = computed(() => {
		if (activeSave.value && activeSave.value.base !== undefined) {
			return saves.value[activeSave.value.base]
		}
		return undefined
	})
	const jsonString = computed(() => {
		return JSON.stringify(
			data.value,
			(key, value) => {
				// Check if the key is "options" and the value is an array
				if (key === 'options' && Array.isArray(value)) {
					// Map the array to extract only the "value" field from each object
					return value.map((item) => item.value)
				} else if (key === 'uuid' || key === 'id') {
					return undefined
				} else if (key === 'saves') {
					return stripUndefined<Save>(
						value.map((save: Save) => (save.createTime ? save : undefined)),
					)
				}
				return value // Return the value as-is for other keys
			},
			2,
		)
	})
	// Actions
	function create(capacity: number, cols: number, rows: number) {
		data.value = {
			capacity: capacity,
			cols: cols,
			rows: rows,
			saves: initializeSaves(capacity),
		}
	}
	function load(file?: File) {
		if (file) {
			const reader = new FileReader() // Create a FileReader instance
			// Define the onload callback
			reader.onload = (e) => {
				if (!e.target || !e.target.result) {
					return
				}
				try {
					// Parse the JSON data
					const parsedData: ExportedData = JSON.parse(e.target.result.toString())
					data.value = {
						capacity: parsedData.capacity,
						rows: parsedData.rows,
						cols: parsedData.cols,
						saves: padUndefined(parsedData.saves, parsedData.capacity).map((value, id) => {
							if (value) {
								return {
									id: id,
									uuid: generateUuid(),
									base: value.base,
									createTime: value.createTime,
									updateTime: value.updateTime,
									description: value.description,
									decisionPoints: value.decisionPoints?.map((value) => ({
										uuid: generateUuid(),
										decision: value.decision,
										description: value.description,
										options: value.options?.map((value) => ({
											value: value,
											uuid: generateUuid(),
										})),
									})),
								}
							} else {
								return {
									id: id,
									uuid: generateUuid(),
									createTime: 0,
									updateTime: 0,
								}
							}
						}),
					}
					updateLocalStorage()
				} catch {
					alert('Invalid JSON file. Please upload a valid JSON file.')
				}
			}
			// Read the file as text
			reader.readAsText(file)
		} else {
			const serializedData = window.localStorage.getItem(dataKey)
			if (serializedData) {
				data.value = JSON.parse(serializedData)
			}
		}
	}

	function updateLocalStorage() {
		window.localStorage.setItem(dataKey, JSON.stringify(data.value))
	}

	function updateSave(save: Save) {
		saves.value[save.id] = save
	}

	function deleteSave() {
		saves.value[activeSaveId.value!] = {
			id: activeSave.value!.id,
			uuid: activeSave.value!.uuid,
			createTime: 0,
			updateTime: 0,
		}
	}

	return {
		// State
		data,
		activeSaveId,
		// Getters
		rows,
		cols,
		capacity,
		savesPerPage,
		totalPages,
		saves,
		activeSave,
		baseSave,
		jsonString,
		// Actions
		create,
		load,
		updateLocalStorage,
		updateSave,
		deleteSave,
	}
})
