<template>
	<div
		class="relative flex items-center justify-center border-2 rounded border-pink-300 hover:bg-pink-50 cursor-pointer aspect-video"
	>
		<template v-if="save.createTime">
			<p class="hidden md:block absolute top-4 left-4 text-sm text-gray-400">
				{{ createTime.toLocaleString() }}
			</p>
			<p class="hidden md:block text-center">{{ save.description }}</p>
			<p
				class="md:absolute md:font-normal md:top-4 md:right-4 md:text-sm md:text-gray-400 font-bold"
			>
				{{ Math.floor(save.id / store.savesPerPage) + 1 }} -
				{{ (save.id % store.savesPerPage) + 1 }}
			</p>
		</template>
		<p v-else class="font-bold md:text-xl">No data</p>
	</div>
</template>

<script setup lang="ts">
import type { Save } from '@/types'
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'

const store = useDataStore()
const props = defineProps<{
	save: Save
}>()

const createTime = computed(() => new Date(props.save.createTime))
</script>
