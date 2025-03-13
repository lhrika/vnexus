<template>
	<article>
		<header class="flex flex-col items-center">
			<Transition
				enter-active-class="transition-all"
				enter-from-class="-translate-y-10 opacity-0 h-0"
				leave-active-class="transition-all"
				leave-to-class="translate-y-10 opacity-0 h-0"
			>
				<div
					v-show="showHeader"
					class="relative w-full h-[90vh] flex flex-col gap-4 items-center justify-center bg-fuchsia-50 transition-all overflow-hidden"
				>
					<div class="absolute top-4">
						<span
							:class="{
								'text-gray-500': activeTab === 'load',
								'text-blue-700': activeTab !== 'load',
								'hover:underline': activeTab !== 'load',
								'cursor-pointer': activeTab !== 'load',
							}"
							@click="activeTab = 'load'"
							>I have data</span
						>
						|
						<span
							:class="{
								'text-gray-500': activeTab === 'new',
								'text-blue-700': activeTab !== 'new',
								'hover:underline': activeTab !== 'new',
								'cursor-pointer': activeTab !== 'new',
							}"
							@click="activeTab = 'new'"
							>Create new data</span
						>
					</div>
					<Transition
						enter-active-class="transition-all"
						enter-from-class="translate-x-10 opacity-0"
						leave-active-class="transition-all"
						leave-to-class="-translate-x-10 opacity-0"
						mode="out-in"
					>
						<NewDataForm v-if="activeTab === 'new'" @create="handleCreateNewData" />
						<div v-else-if="activeTab === 'load'" class="flex flex-col gap-4">
							<label
								class="border-4 border-gray-400 text-center border-dashed text-lg md:text-2xl text-gray-500 hover:text-gray-700 cursor-pointer flex justify-center items-center w-80 md:w-120 aspect-video"
								@drop.prevent="handleDrop"
								@dragover.prevent=""
							>
								Drop your file here<br />
								or<br />
								Click here to upload
								<input type="file" @change="handleFileUpload" accept=".json" hidden />
							</label>
							<button
								type="button"
								class="flex items-center justify-center gap-1 cursor-pointer"
								@click="downloadJson"
							>
								<ArrowDownCircleIcon class="size-6" />Download
							</button>
						</div>
					</Transition>
				</div>
			</Transition>
			<label
				class="border-t-16 border-b-0 border-l-16 border-transparent border-r-16 border-t-pink-600 w-0 h-0 transition-transform"
				:class="{
					'rotate-180': showHeader,
					'-mt-4': showHeader,
				}"
				><input type="checkbox" v-model="showHeader" hidden />
			</label>
		</header>

		<main class="container max-w-screen-lg mx-auto p-4">
			<template v-if="data">
				<SaveList
					:max="data.max"
					:rows="data.rows"
					:cols="data.cols"
					:layout="layout"
					v-model="data.saves"
				></SaveList>
			</template>
		</main>
	</article>
	<SettingPopup v-model:layout="layout" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import SaveList from './components/SaveList.vue'
import { ArrowDownCircleIcon } from '@heroicons/vue/24/outline'
import NewDataForm from './components/NewDataForm.vue'
import SettingPopup from './components/SettingPopup.vue'
import type { Data, ExportedData } from './types'
import { generateUuid } from './utils'
const dataKey = 'VNexusData'
const debugData = {
	max: 120,
	rows: 3,
	cols: 4,
	saves: [],
}
const data = ref<Data>(debugData)

onMounted(() => {
	const serializedData = window.localStorage.getItem(dataKey)
	if (serializedData) {
		data.value = JSON.parse(serializedData)
	}
})

const handleCreateNewData = (max: number, cols: number, rows: number) => {
	data.value = {
		max: max,
		cols: cols,
		rows: rows,
		saves: [],
	}
}

const downloadJson = () => {
	// Step 1: Convert JSON data to a string
	const jsonString = JSON.stringify(
		data.value,
		(key, value) => {
			// Check if the key is "options" and the value is an array
			if (key === 'options' && Array.isArray(value)) {
				// Map the array to extract only the "value" field from each object
				return value.map((item) => item.value)
			} else if (key === 'uuid') {
				return undefined
			}
			return value // Return the value as-is for other keys
		},
		2,
	)

	// Step 2: Create a Blob from the JSON string
	const blob = new Blob([jsonString], { type: 'application/json' })

	// Step 3: Generate a URL for the Blob
	const url = URL.createObjectURL(blob)

	// Step 4: Create a temporary <a> element and trigger the download
	const link = document.createElement('a')
	link.href = url
	link.download = 'data.json' // Specify the filename
	link.click()

	// Step 5: Clean up the URL object
	URL.revokeObjectURL(url)
}

const loadFile = (file: File) => {
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
				max: parsedData.max,
				rows: parsedData.rows,
				cols: parsedData.cols,
				saves: parsedData.saves.map((value) => ({
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
				})),
			}
		} catch {
			alert('Invalid JSON file. Please upload a valid JSON file.')
		}
	}
	// Read the file as text
	reader.readAsText(file)
}

const handleFileUpload = (event: Event) => {
	if (event.target) {
		const target = event.target as HTMLInputElement
		const file = target.files?.item(0)
		if (file) {
			loadFile(file)
		}
	}
}

// DEBUG: Print the data object on update
watch(
	data,
	(value) => {
		console.log(JSON.stringify(value))
		window.localStorage.setItem(dataKey, JSON.stringify(value))
	},
	{
		deep: true,
	},
)

// Header
const showHeader = ref<boolean>(false)
const activeTab = ref<string>('load')

const handleDrop = (ev: DragEvent) => {
	if (ev.dataTransfer) {
		if (ev.dataTransfer.items) {
			if (ev.dataTransfer.items.length > 1) {
				alert('Please upload only 1 file.')
				return
			}
			const item = ev.dataTransfer.items[0]
			if (item.kind === 'file') {
				const file = item.getAsFile()
				if (file) {
					loadFile(file)
				}
			}
		} else {
			const file = ev.dataTransfer.files.item(0)
			if (file) {
				loadFile(file)
			}
		}
	}
}
const layout = ref<string>('grid')
</script>
