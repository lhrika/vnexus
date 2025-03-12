<template>
	<div>
		<div
			class="gap-4"
			:class="{
				grid: layout === 'grid',
				flex: layout === 'list',
				'flex-col': layout === 'list',
			}"
			:style="{
				gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
			}"
		>
			<SaveSlot
				v-for="i in savesPerPage"
				:key="i"
				:save="model![i - 1 + page * savesPerPage]"
				:saveId="i - 1 + page * savesPerPage"
				:savesPerPage
				@click="chooseSave(i - 1 + page * savesPerPage)"
			></SaveSlot>
		</div>
		<div class="flex justify-center mt-4">
			<button
				type="button"
				class="border border-r-0 rounded-l p-1 text-pink-300 hover:text-pink-400 border-pink-300 cursor-pointer hover:bg-pink-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-auto"
				:disabled="page <= 0"
				@click="prevPage"
			>
				<ChevronLeftIcon class="size-6" />
			</button>
			<div class="border border-pink-300 py-1 px-2 font-bold">
				{{ page + 1 }} / {{ totalPages }}
			</div>
			<button
				type="button"
				class="border border-l-0 rounded-r p-1 text-pink-300 hover:text-pink-400 border-pink-300 cursor-pointer hover:bg-pink-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-auto"
				:disabled="page >= totalPages - 1"
				@click="nextPage"
			>
				<ChevronRightIcon class="size-6" />
			</button>
		</div>
		<SaveModal
			ref="save-modal"
			v-model="activeSave"
			:save-id="activeSaveId"
			:saves-per-page="savesPerPage"
			@close-modal="handleCloseModal"
			@choose-base="handleChooseBase"
		></SaveModal>
	</div>
</template>

<script setup lang="ts">
import type { Save } from '@/types'
import { ChevronRightIcon } from '@heroicons/vue/24/solid'
import { ChevronLeftIcon } from '@heroicons/vue/24/solid'
import SaveSlot from './SaveSlot.vue'
import { nextTick, ref, useTemplateRef, computed } from 'vue'
import SaveModal from './SaveModal.vue'

// The model is an array of saves
const model = defineModel<(Save | undefined)[]>()
const props = defineProps<{
	max: number
	rows: number
	cols: number
	layout: string
}>()

// Current page
const page = ref(0)
const savesPerPage = computed(() => props.rows * props.cols)
const totalPages = computed(() => Math.ceil(props.max / savesPerPage.value))
// Functions for navigation between pages
const nextPage = () => {
	page.value++
}
const prevPage = () => {
	page.value--
}

// The save shown in the modal
const activeSave = ref<Save>()
const activeSaveId = ref<number>()
// Whether is choosing base
const isChoosingBase = ref<boolean>(false)

const saveModal = useTemplateRef('save-modal')
const showModal = () => {
	saveModal.value?.showModal()
}

const chooseSave = (id: number) => {
	if (isChoosingBase.value) {
		activeSave.value!.base = id === activeSaveId.value ? undefined : id
		isChoosingBase.value = false
	} else {
		activeSave.value = model.value![id] ?? {
			createTime: 0,
			updateTime: 0,
		}
		activeSaveId.value = id
	}
	nextTick(() => {
		showModal()
	})
}

// When modal is closed, data should be updated
const handleCloseModal = (id: number, action: string) => {
	if (action === 'save') {
		let lastIndex = model.value!.length - 1
		while (lastIndex < id) {
			model.value!.push(undefined)
			lastIndex++
		}
		if (!model.value![id]) {
			model.value![id] = activeSave.value
		}
	} else if (action === 'delete') {
		if (model.value![id]) {
			if (id === model.value!.length - 1) {
				model.value!.splice(id, 1)
			} else {
				model.value![id] = undefined
			}
		}
	}
}

const handleChooseBase = () => {
	isChoosingBase.value = true
}
</script>
