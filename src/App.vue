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
			<SaveList :layout="layout" @select-save="handleSelectSave"></SaveList>
		</main>
	</article>
	<SettingPopup v-model:layout="layout" />
	<SaveModal
		ref="saveModal"
		v-model="model"
		:open="isModalOpen"
		@close-modal="handleCloseModal"
		@choose-base="handleChooseBase"
	></SaveModal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SaveList from './components/SaveList.vue'
import { ArrowDownCircleIcon } from '@heroicons/vue/24/outline'
import NewDataForm from './components/NewDataForm.vue'
import SettingPopup from './components/SettingPopup.vue'
import { useDataStore } from './stores/data'
import SaveModal from './components/SaveModal.vue'
import type { Save } from './types'

const store = useDataStore()

onMounted(() => {
	store.load()
	const unsubscribe = store.$onAction(({ name, store, after }) => {
		if (name === 'create' || name === 'updateSave' || name === 'deleteSave') {
			after(() => {
				console.log(JSON.stringify(store.data))
				store.updateLocalStorage()
			})
		}
	})
	onUnmounted(() => {
		unsubscribe()
	})
})

const handleCreateNewData = (capacity: number, cols: number, rows: number) => {
	store.create(capacity, cols, rows)
	showHeader.value = false
}

const downloadJson = () => {
	// Step 1: Convert JSON data to a string
	const jsonString = store.jsonString

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

const handleFileUpload = (event: Event) => {
	if (event.target) {
		const target = event.target as HTMLInputElement
		const file = target.files?.item(0)
		if (file) {
			store.load(file)
		}
	}
}

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
					store.load(file)
				}
			}
		} else {
			const file = ev.dataTransfer.files.item(0)
			if (file) {
				store.load(file)
			}
		}
	}
}
const layout = ref<string>('grid')

// Modal related code
const isModalOpen = ref<boolean>(false)
const isChoosingBase = ref<boolean>(false)
const model = ref<Save>()
const handleSelectSave = (id: number) => {
	if (isChoosingBase.value) {
		model.value!.base = id === model.value!.id ? undefined : id
		isChoosingBase.value = false
	} else {
		store.activeSaveId = id
		model.value = JSON.parse(JSON.stringify(store.activeSave))
	}
	isModalOpen.value = true
}

// When modal is closed, data should be updated
const handleCloseModal = (action: string) => {
	if (action === 'save') {
		store.updateSave(model.value!)
	} else if (action === 'delete') {
		store.deleteSave()
	}
	isModalOpen.value = false
	store.activeSaveId = undefined
	model.value = undefined
}

const handleChooseBase = () => {
	isModalOpen.value = false
	isChoosingBase.value = true
}
</script>
