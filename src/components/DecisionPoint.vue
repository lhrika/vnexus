<template>
	<div ref="componentRoot">
		<template v-if="!active">
			<p class="border-l-4 border-pink-400 pl-2">{{ model.description }}</p>
			<p class="border-l-4 border-transparent pl-2">
				{{ model.decision }}
				<span class="text-gray-500">
					<template v-for="(option, index) in model.options" :key="index"> / {{ option }}</template>
				</span>
			</p>
		</template>
		<div v-if="active" class="flex flex-col gap-2 py-3 px-4 bg-purple-50">
			<button type="button" class="self-end cursor-pointer" @click="remove">
				<XMarkIcon class="size-4" />
			</button>
			<label class="flex flex-col">
				Description:
				<input
					type="text"
					class="border border-pink-300 outline-pink-400 rounded px-2 py-1"
					v-model="model.description"
				/>
			</label>
			<label class="flex flex-col">
				Decision:
				<input
					type="text"
					class="border border-pink-300 outline-pink-400 rounded px-2 py-1"
					v-model="model.decision"
				/>
			</label>
			<div class="relative">
				Options:
				<div v-if="model?.options" class="flex flex-col gap-1">
					<div class="flex gap-1 mr-8" v-for="i in model!.options!.length" :key="i">
						<input
							type="text"
							class="grow text-sm border border-pink-300 outline-pink-400 rounded px-2 py-1"
							v-model="model.options[i - 1]"
						/>
						<button
							type="button"
							class="cursor-pointer text-rose-400 hover:text-rose-500"
							@click.stop="handleRemoveOption(i)"
						>
							<TrashIcon class="size-4" />
						</button>
					</div>
				</div>
				<button
					type="button"
					class="absolute block bottom-0 right-0 p-1 border rounded-full cursor-pointer text-purple-300 hover:text-purple-400 disabled:text-gray-300 disabled:hover:text-gray-300"
					@click="addOption"
					:disabled="!allOptionsValid"
				>
					<PlusIcon class="size-4" />
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { DecisionPoint } from '@/types'
import { PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/vue/16/solid'
import { useTemplateRef, onMounted, onUnmounted, ref, computed } from 'vue'

const model = defineModel<DecisionPoint>({ required: true })

const active = ref<boolean>(false)

const addOption = () => {
	if (model.value!.options === undefined) {
		model.value!.options = []
	}
	model.value!.options.push('')
}

const allOptionsValid = computed(() => {
	if (model.value.options === undefined) {
		return true
	}
	return (
		model.value.options?.findIndex((option) => {
			return option.trim().length < 1
		}) < 0
	)
})

const handleRemoveOption = (i: number) => {
	model.value.options?.splice(i - 1, 1)
}

const valid = computed(() => {
	return model.value?.decision && model.value.description
})

const componentRoot = useTemplateRef('componentRoot')
const handleClickOutside = (event: MouseEvent) => {
	if (componentRoot.value && !componentRoot.value.contains(event.target as Element)) {
		if (valid.value) {
			active.value = false
		} else {
			active.value = false
			emit('remove')
		}
	} else {
		active.value = true
	}
}

onMounted(() => {
	active.value = !valid.value
	setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})

const emit = defineEmits<{
	(event: 'remove'): void
	(event: 'add'): void
}>()
const remove = () => {
	active.value = false
	emit('remove')
}
</script>
