<template>
	<Transition
		enter-active-class="transition-colors"
		leave-active-class="transition-colors"
		enter-from-class="bg-transparent"
		leave-to-class="bg-transparent"
	>
		<div
			v-show="open"
			class="fixed inset-0 z-50 p-4 flex items-start md:items-center justify-center bg-black/80"
			@click.self="cancel"
		>
			<Transition
				enter-active-class="transition-opacity transition-transform"
				leave-active-class="transition-opacity transition-transform"
				enter-from-class="opacity-0 scale-95"
				leave-to-class="opacity-0 scale-95"
			>
				<div
					v-show="open"
					v-if="model"
					class="relative bg-white p-4 rounded max-w-screen-md grow flex flex-col gap-4 max-h-full overflow-auto"
				>
					<button
						type="button"
						class="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-900"
						@click="cancel"
					>
						<XMarkIcon class="size-6" />
					</button>
					<div>
						<span v-if="model.base !== undefined">🟢 Base save is </span>
						<span class="hover:underline text-blue-700 cursor-pointer" @click.prevent="chooseBase">
							{{
								model.base === undefined
									? 'Select base save'
									: `${Math.floor(model.base / store.savesPerPage) + 1} - ${(model.base % store.savesPerPage) + 1}`
							}}
						</span>
					</div>
					<div>
						<textarea
							v-if="model"
							type="text"
							class="border border-pink-300 outline-pink-400 rounded p-2 w-full"
							v-model="model!.description"
						></textarea>
					</div>
					<div class="flex flex-col gap-2 relative">
						<TransitionGroup
							enter-active-class="transition-all"
							leave-active-class="transition-all"
							move-class="transition-all"
							enter-from-class="opacity-0 -translate-y-4"
							leave-to-class="opacity-0 -translate-y-4"
						>
							<DecisionPoint
								v-for="i in model.decisionPoints?.length"
								:key="model.decisionPoints![i - 1].uuid"
								v-model="model.decisionPoints![i - 1]"
								:tooltip="
									model.decisionPoints!.length === 1 &&
									!validateDecisionPoint(model.decisionPoints![0])
										? store.baseSave?.description
										: undefined
								"
								@remove="handleRemoveDecisionPoint(i - 1)"
							></DecisionPoint>
						</TransitionGroup>
						<button
							v-if="allDecisionPointsValid"
							class="self-center px-4 py-1 cursor-pointer rounded-full border border-pink-400 text-pink-400 opacity-50 hover:opacity-100"
							@click="handleAddDecisionPoint()"
						>
							<PlusIcon class="size-6"></PlusIcon>
						</button>
					</div>
					<div class="flex flex-col md:flex-row-reverse items-center justify-center gap-4">
						<button
							v-if="isModified"
							type="button"
							class="flex justify-center items-center gap-1 py-3 px-4 bg-pink-300 text-white font-bold hover:bg-pink-400 rounded cursor-pointer max-w-96 self-center w-full"
							@click="saveChange"
						>
							<BookmarkSquareIcon class="size-5" />Save
						</button>
						<button
							v-if="store.activeSave"
							type="button"
							class="flex justify-center items-center gap-1 py-3 px-4 bg-red-800 text-white font-bold hover:bg-red-700 rounded cursor-pointer max-w-96 w-full self-center"
							@click="deleteSave"
						>
							<TrashIcon class="size-5" />
							Delete
						</button>
					</div>
					<button
						type="button"
						@click="showChronicle = !showChronicle"
						class="border rounded px-4 py-3 cursor-pointer bg-gray-500 hover:bg-gray-400 text-white font-bold w-full max-w-96 self-center"
					>
						Chronicle
					</button>
					<div
						v-if="showChronicle"
						class="overflow-auto max-h-full relative p-4 border rounded border-pink-300"
					>
						<button
							class="sticky float-right top-0 right-0 cursor-pointer hover:opacity-80"
							@click="copyChronicle"
						>
							<Transition
								enter-active-class="transition-opacity"
								leave-active-class="transition-opacity"
								enter-from-class="opacity-0"
								leave-to-class="opacity-0"
								mode="out-in"
							>
								<CheckIcon v-if="copySucceeded" class="size-6 inline-block" />
								<DocumentDuplicateIcon v-else class="size-6 inline-block" />
							</Transition>
							Copy
						</button>
						<pre>{{ chronicle }}</pre>
					</div>
				</div>
			</Transition>
		</div>
	</Transition>
</template>
<script setup lang="ts">
import type { DecisionPoint as DecisionPointType, Save } from '@/types'
import { computed, ref } from 'vue'
import DecisionPoint from './DecisionPoint.vue'
import { XMarkIcon, PlusIcon } from '@heroicons/vue/24/solid'
import { BookmarkSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { generateUuid, validateDecisionPoint, validateOption } from '@/utils'
import { useDataStore } from '@/stores/data'
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/vue/24/outline'

const store = useDataStore()
const model = defineModel<Save>()
defineProps<{
	open: boolean
}>()
const emit = defineEmits<{
	(event: 'closeModal', action: 'save' | 'cancel' | 'delete'): void
	(event: 'chooseBase'): void
}>()

const isModified = computed(() => {
	if (store.activeSave) {
		const modelValue: Save = JSON.parse(JSON.stringify(model.value))
		if (modelValue.decisionPoints) {
			modelValue.decisionPoints = modelValue.decisionPoints.filter((decisionPoint) =>
				validateDecisionPoint(decisionPoint),
			)
			for (const decisionPoint of modelValue.decisionPoints) {
				if (decisionPoint.options) {
					decisionPoint.options = decisionPoint.options.filter((option) => validateOption(option))
				}
				if (!decisionPoint.options || decisionPoint.options.length < 1) {
					decisionPoint.options = undefined
				}
			}
		}
		if (!modelValue.decisionPoints || modelValue.decisionPoints.length < 1) {
			modelValue.decisionPoints = undefined
		}
		return JSON.stringify(store.activeSave) !== JSON.stringify(modelValue)
	}
	return true
})

const saveChange = () => {
	if (model.value!.createTime < 1) {
		model.value!.createTime = Date.now()
	}
	model.value!.updateTime = Date.now()
	if (model.value!.decisionPoints) {
		model.value!.decisionPoints = model.value!.decisionPoints.filter((decisionPoint) =>
			validateDecisionPoint(decisionPoint),
		)
		for (const decisionPoint of model.value!.decisionPoints) {
			if (decisionPoint.options) {
				decisionPoint.options = decisionPoint.options.filter((option) => validateOption(option))
			}
			if (!decisionPoint.options || decisionPoint.options.length < 1) {
				decisionPoint.options = undefined
			}
		}
	}
	if (!model.value!.decisionPoints || model.value!.decisionPoints.length < 1) {
		model.value!.decisionPoints = undefined
	}
	showChronicle.value = false
	emit('closeModal', 'save')
}

const cancel = () => {
	showChronicle.value = false
	emit('closeModal', 'cancel')
}

const deleteSave = () => {
	showChronicle.value = false
	emit('closeModal', 'delete')
}

// Hide modal temporarily to choose base save
const chooseBase = () => {
	emit('chooseBase')
}

const allDecisionPointsValid = computed(() => {
	if (model.value!.decisionPoints === undefined) {
		return true
	}
	return (
		model.value!.decisionPoints.findIndex((decisionPoint: DecisionPointType) => {
			return !validateDecisionPoint(decisionPoint)
		}) < 0
	)
})

const handleAddDecisionPoint = () => {
	if (model.value!.decisionPoints === undefined) {
		model.value!.decisionPoints = []
	}
	if (
		model.value!.decisionPoints.length < 1 ||
		validateDecisionPoint(model.value!.decisionPoints[model.value!.decisionPoints.length - 1])
	) {
		model.value!.decisionPoints.push({
			description: '',
			decision: '',
			uuid: generateUuid(),
		})
	}
}

const handleRemoveDecisionPoint = (i: number) => {
	model.value?.decisionPoints?.splice(i, 1)
}

const showChronicle = ref(false)
const chronicle = computed(() => {
	const getAllSaves = (startSave: Save | undefined): Save[] => {
		const saves: Save[] = []
		let currentSave = startSave
		while (currentSave) {
			saves.push(currentSave)
			currentSave = currentSave.base ? store.saves[currentSave.base] : undefined
		}
		return saves.reverse()
	}
	const saves = getAllSaves(store.activeSave)
	const decisionPoints = saves.reduce<DecisionPointType[]>((acc, save) => {
		if (save.decisionPoints) {
			return acc.concat(save.decisionPoints) // Create a reversed copy to avoid mutation
		}
		return acc
	}, [])
	return decisionPoints
		.reduce((acc, dp) => {
			return `${acc}
✨${dp.description}
　🟢 ${dp.decision}${
				dp.options && dp.options.length > 0
					? dp.options.reduce((acc, option) => {
							return `${acc}\n　❌ ${option.value}`
						}, '')
					: ''
			}`
		}, '')
		.trim()
})
const copySucceeded = ref<boolean>(false)
const copyChronicle = () => {
	navigator.clipboard.writeText(chronicle.value).then(() => {
		copySucceeded.value = true
		setTimeout(() => (copySucceeded.value = false), 1000)
	})
}
</script>
