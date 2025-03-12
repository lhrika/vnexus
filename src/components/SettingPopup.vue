<template>
	<div class="fixed right-4 bottom-4" ref="componentRoot">
		<button
			type="button"
			class="flex items-center justify-center p-2 text-white rounded-full shadow-lg bg-pink-300 opacity-50 hover:opacity-100 cursor-pointer"
			@click="showMenu = !showMenu"
		>
			<AdjustmentsHorizontalIcon class="size-6" />
		</button>
		<Transition
			enter-active-class="transition-all origin-bottom-right"
			leave-active-class="transition-all origin-bottom-right"
			enter-from-class="opacity-0 scale-0"
			leave-to-class="opacity-0 scale-0"
		>
			<div
				v-if="showMenu"
				class="absolute right-full bottom-0 -translate-y-4 -translate-x-1 shadow flex flex-col border-pink-400 border-2 rounded bg-pink-100/50"
			>
				<button
					type="button"
					class="flex justify-start items-center text-nowrap gap-1 cursor-pointer hover:bg-pink-200/50 py-2 px-4"
					@click="switchLayout"
				>
					<QueueListIcon v-if="layout === 'grid'" class="size-4" /><TableCellsIcon
						v-else-if="layout === 'list'"
						class="size-4"
					/>Switch to {{ layout === 'list' ? 'grid' : 'list' }} view
				</button>
				<button
					type="button"
					class="flex justify-start items-center text-nowrap gap-1 cursor-pointer hover:bg-pink-200/50 py-2 px-4"
				>
					<QuestionMarkCircleIcon class="size-4" /> Help
				</button>
			</div>
		</Transition>
	</div>
</template>
<script setup lang="ts">
import { ref, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { QueueListIcon, QuestionMarkCircleIcon, TableCellsIcon } from '@heroicons/vue/16/solid'
import { AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
const showMenu = ref<boolean>(false)
const componentRoot = useTemplateRef('componentRoot')
const handleClickOutside = (e: MouseEvent) => {
	if (
		!e.target ||
		!(e.target instanceof Element) ||
		!componentRoot.value?.contains(e.target as Element)
	) {
		showMenu.value = false
	}
}
onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})

const layout = defineModel('layout', { required: true })
const switchLayout = () => {
	if (layout.value === 'grid') {
		layout.value = 'list'
	} else if (layout.value === 'list') {
		layout.value = 'grid'
	}
}
</script>
