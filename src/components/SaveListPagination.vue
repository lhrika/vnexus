<template>
	<div class="flex justify-center mt-4">
		<button
			type="button"
			class="border rounded-l p-1 text-pink-300 hover:text-pink-400 border-pink-300 cursor-pointer hover:bg-pink-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-auto"
			:disabled="page <= 0"
			@click="prev"
		>
			<ChevronLeftIcon class="size-6" />
		</button>
		<div class="relative">
			<div
				class="w-full h-full border-y border-pink-300 flex justify-center items-center min-w-20 font-bold"
			>
				{{ page + 1 }} / {{ total }}
			</div>
			<select
				:value="page"
				class="absolute top-0 left-0 w-full h-full opacity-0"
				@change="emit('update:page', parseInt(($event.target as HTMLSelectElement).value))"
			>
				<option v-for="page in total" :key="page" :value="page - 1">
					{{ page }}
				</option>
			</select>
		</div>
		<button
			type="button"
			class="border rounded-r p-1 text-pink-300 hover:text-pink-400 border-pink-300 cursor-pointer hover:bg-pink-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-auto"
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

const props = defineProps<{
	page: number
	total: number
}>()

const emit = defineEmits<{
	(event: 'update:page', page: number): void
}>()

const prev = () => {
	if (props.page > 0) {
		emit('update:page', props.page - 1)
	}
}
const next = () => {
	if (props.page < props.total - 1) {
		emit('update:page', props.page + 1)
	}
}
</script>
