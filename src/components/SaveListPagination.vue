<template>
	<div class="flex justify-center mt-4">
		<button
			type="button"
			class="border border-r-0 rounded-l p-1 text-pink-300 hover:text-pink-400 border-pink-300 cursor-pointer hover:bg-pink-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-auto"
			:disabled="page <= 0"
			@click="prev"
		>
			<ChevronLeftIcon class="size-6" />
		</button>
		<div class="relative">
			<div
				class="bg-white w-full h-full border border-pink-300 flex justify-center items-center min-w-20 font-bold"
			>
				{{ page + 1 }} / {{ total }}
			</div>
			<select
				v-model="targetPage"
				@change="handleChange"
				class="absolute top-0 left-0 w-full h-full opacity-0"
			>
				<option v-for="page in total" :key="page" :value="page - 1">
					{{ page }}
				</option>
			</select>
		</div>
		<button
			type="button"
			class="border border-l-0 rounded-r p-1 text-pink-300 hover:text-pink-400 border-pink-300 cursor-pointer hover:bg-pink-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-auto"
			:disabled="page >= total - 1"
			@click="next"
		>
			<ChevronRightIcon class="size-6" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/24/solid'
import { ChevronLeftIcon } from '@heroicons/vue/24/solid'
import { ref } from 'vue'
const props = defineProps<{
	total: number
	page: number
}>()
const emit = defineEmits<{
	(event: 'prev'): void
	(event: 'next'): void
	(event: 'goto', target: number): void
}>()
const targetPage = ref<number>(props.page)
const prev = () => {
	if (props.page > 0) {
		emit('prev')
	}
}
const next = () => {
	if (props.page < props.total - 1) {
		emit('next')
	}
}
const handleChange = () => {
	emit('goto', targetPage.value)
}
</script>
