<template>
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-1">
			<label for="max">Max Saves:</label>
			<input
				v-model="max"
				type="number"
				name="max"
				id="max"
				min="1"
				class="border border-pink-300 rounded px-2 py-1 outline-pink-400"
			/>
		</div>
		<div class="flex gap-2">
			<div class="flex flex-col gap-1">
				<label for="cols">Columns:</label>
				<input
					v-model="cols"
					type="number"
					name="cols"
					id="cols"
					min="1"
					class="border border-pink-300 rounded px-2 py-1 outline-pink-400"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label for="rows">Rows:</label>
				<input
					v-model="rows"
					type="number"
					name="rows"
					id="rows"
					min="1"
					class="border border-pink-300 rounded px-2 py-1 outline-pink-400"
				/>
			</div>
		</div>
		<button
			type="button"
			class="bg-pink-300 text-white font-bold px-4 py-2 rounded hover:bg-pink-400 cursor-pointer"
			@click="handleClick"
		>
			Create
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const max = ref<number>(120)
const cols = ref<number>(4)
const rows = ref<number>(3)

const emit = defineEmits<{
	(event: 'create', max: number, cols: number, rows: number): void
}>()

const handleClick = () => {
	emit('create', max.value, cols.value, rows.value)
}
</script>
