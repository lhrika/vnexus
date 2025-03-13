<template>
	<div>
		<Transition
			enter-active-class="transition-all"
			leave-active-class="transition-all"
			:enter-from-class="enterFromClass"
			:leave-to-class="leaveToClass"
			mode="out-in"
		>
			<div
				:key="`page-${page}`"
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
				<TransitionGroup move-class="transition-all">
					<SaveSlot
						v-for="i in savesPerPage"
						:key="model[i - 1 + page * savesPerPage]?.createTime ?? generateUuid()"
						:save="model[i - 1 + page * savesPerPage]"
						:saveId="i - 1 + page * savesPerPage"
						:savesPerPage
						@click="chooseSave(i - 1 + page * savesPerPage)"
					></SaveSlot>
				</TransitionGroup>
			</div>
		</Transition>
		<SaveListPagination
			:total="totalPages"
			:page="page"
			@prev="prevPage"
			@next="nextPage"
			@goto="gotoPage"
		/>
		<SaveModal
			ref="saveModal"
			v-model="activeSave"
			:open="isModalOpen"
			:save-id="activeSaveId"
			:saves-per-page="savesPerPage"
			@close-modal="handleCloseModal"
			@choose-base="handleChooseBase"
		></SaveModal>
	</div>
</template>

<script setup lang="ts">
import type { Save } from '@/types'
import SaveSlot from './SaveSlot.vue'
import { nextTick, ref, computed } from 'vue'
import SaveModal from './SaveModal.vue'
import { generateUuid } from '@/utils'
import SaveListPagination from './SaveListPagination.vue'

// The model is an array of saves
const model = defineModel<(Save | undefined)[]>({ required: true })
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
const enterFromClass = ref<string>()
const leaveToClass = ref<string>()
const nextPage = () => {
	enterFromClass.value = 'opacity-0 translate-x-10'
	leaveToClass.value = 'opacity-0 -translate-x-10'
	page.value++
}
const prevPage = () => {
	enterFromClass.value = 'opacity-0 -translate-x-10'
	leaveToClass.value = 'opacity-0 translate-x-10'
	page.value--
}
const gotoPage = (target: number) => {
	if (target < page.value) {
		enterFromClass.value = 'opacity-0 -translate-x-10'
		leaveToClass.value = 'opacity-0 translate-x-10'
	} else {
		enterFromClass.value = 'opacity-0 translate-x-10'
		leaveToClass.value = 'opacity-0 -translate-x-10'
	}
	page.value = target
}

// The save shown in the modal
const activeSave = ref<Save>()
const activeSaveId = ref<number>()
// Whether is choosing base
const isChoosingBase = ref<boolean>(false)

const isModalOpen = ref<boolean>(false)

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
		isModalOpen.value = true
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
	isModalOpen.value = false
	activeSave.value = undefined
	activeSaveId.value = undefined
}

const handleChooseBase = () => {
	isModalOpen.value = false
	isChoosingBase.value = true
}
</script>
