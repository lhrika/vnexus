<template>
	<div ref="componentRoot">
		<Transition
			enter-active-class="transition-all"
			leave-active-class="transition-all"
			enter-from-class="scale-y-90 opacity-0"
			leave-to-class="scale-y-90 opacity-0"
			mode="out-in"
		>
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
					<div class="flex flex-col gap-1">
						<TransitionGroup
							enter-active-class="transition-all"
							leave-active-class="transition-all"
							enter-from-class="opacity-0 -translate-x-4"
							leave-to-class="opacity-0 translate-x-4"
							move-class="transition-all"
						>
							<div
								class="flex gap-1 mr-8"
								v-for="i in model.options?.length"
								:key="model.options![i - 1].uuid"
							>
								<input
									type="text"
									class="grow text-sm border border-pink-300 outline-pink-400 rounded px-2 py-1"
									v-model="model.options![i - 1].value"
								/>
								<button
									type="button"
									class="cursor-pointer text-rose-400 hover:text-rose-500"
									@click.stop="handleRemoveOption(i - 1)"
								>
									<TrashIcon class="size-4" />
								</button></div
						></TransitionGroup>
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
			<div v-else>
				<p class="border-l-4 border-pink-400 pl-2">{{ model.description }}</p>
				<p class="border-l-4 border-transparent pl-2">
					{{ model.decision }}
					<span class="text-gray-500">
						<template v-for="option in model.options" :key="option.uuid">
							/ {{ option.value }}</template
						>
					</span>
				</p>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import type { DecisionPoint } from '@/types'
import { generateUuid } from '@/utils'
import { PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/vue/16/solid'
import { useTemplateRef, onMounted, onUnmounted, ref, computed } from 'vue'

const model = defineModel<DecisionPoint>({ required: true })
const valid = computed(() => {
	return model.value?.decision && model.value.description
})
const active = ref<boolean>(!valid.value)

const addOption = () => {
	if (model.value!.options === undefined) {
		model.value!.options = []
	}
	model.value!.options.push({
		value: '',
		uuid: generateUuid(),
	})
}

const allOptionsValid = computed(() => {
	if (model.value.options === undefined) {
		return true
	}
	return (
		model.value.options?.findIndex((option) => {
			return option.value.trim().length < 1
		}) < 0
	)
})

const handleRemoveOption = (i: number) => {
	model.value.options?.splice(i, 1)
}

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
	emit('remove')
}
</script>
