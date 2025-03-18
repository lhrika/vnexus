<template>
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
				gridTemplateColumns: `repeat(${store.cols}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${store.rows}, minmax(0, 1fr))`,
			}"
		>
			<TransitionGroup move-class="transition-all">
				<SaveSlot
					v-for="save of saves"
					:key="save!.uuid"
					:save="save!"
					@click="selectSave(save!.id)"
				></SaveSlot>
			</TransitionGroup>
		</div>
	</Transition>
	<SaveListPagination :page="page" :total="store.totalPages" @update:page="handleUpdatePage" />
</template>

<script setup lang="ts">
import SaveSlot from './SaveSlot.vue'
import { ref } from 'vue'
import SaveListPagination from './SaveListPagination.vue'
import { useDataStore } from '@/stores/data'

const store = useDataStore()

defineProps<{
	layout: string
}>()

// Current page
const page = ref(0)
// Save IDs on current page
const saves = ref({
	[Symbol.iterator]() {
		let id = page.value * store.savesPerPage
		return {
			next() {
				if (id < (page.value + 1) * store.savesPerPage) {
					return { value: store.saves[id++], done: false }
				} else {
					return { value: undefined, done: true }
				}
			},
		}
	},
})
// Functions for navigation between pages
const enterFromClass = ref<string>()
const leaveToClass = ref<string>()
const handleUpdatePage = (target: number) => {
	if (target < page.value) {
		enterFromClass.value = 'opacity-0 -translate-x-10'
		leaveToClass.value = 'opacity-0 translate-x-10'
	} else {
		enterFromClass.value = 'opacity-0 translate-x-10'
		leaveToClass.value = 'opacity-0 -translate-x-10'
	}
	page.value = target
}

const emit = defineEmits<{
	(event: 'selectSave', id: number): void
}>()
const selectSave = (id: number) => {
	emit('selectSave', id)
}
</script>
