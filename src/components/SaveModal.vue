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
					class="relative bg-white p-4 rounded max-w-screen-md grow flex flex-col gap-4"
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
									: `${Math.floor(model.base / savesPerPage) + 1} - ${(model.base % savesPerPage) + 1}`
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
						<template v-if="model.decisionPoints && model.decisionPoints.length > 0">
							<DecisionPoint
								v-for="i in model!.decisionPoints!.length"
								:key="i"
								v-model="model!.decisionPoints[i - 1]"
								@remove="handleRemoveDecisionPoint(i)"
								@add="handleAddDecisionPoint"
							></DecisionPoint>
						</template>
						<button
							v-if="allDecisionPointsValid"
							class="self-center px-4 py-1 cursor-pointer rounded-full border border-pink-400 text-pink-400 opacity-50 hover:opacity-100"
							@click="handleAddDecisionPoint()"
						>
							<PlusIcon class="size-6"></PlusIcon>
						</button>
					</div>
					<button
						v-if="isNewSave"
						type="button"
						class="flex justify-center items-center gap-1 py-3 px-4 bg-pink-300 text-white font-bold hover:bg-pink-400 rounded cursor-pointer max-w-96 self-center w-full"
						@click="saveChange"
					>
						<BookmarkSquareIcon class="size-5" />Save
					</button>
					<button
						v-else
						type="button"
						class="flex justify-center items-center gap-1 py-3 px-4 bg-gray-400 text-white font-bold hover:bg-gray-500 rounded cursor-pointer max-w-96 w-full self-center"
						@click="deleteSave"
					>
						<TrashIcon class="size-5" />
						Delete
					</button>
				</div>
			</Transition>
		</div>
	</Transition>
</template>
<script setup lang="ts">
import type { DecisionPoint as DecisionPointType, Save } from '@/types'
import { computed } from 'vue'
import DecisionPoint from './DecisionPoint.vue'
import { XMarkIcon, PlusIcon } from '@heroicons/vue/24/solid'
import { BookmarkSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

// Model is the save editting
const model = defineModel<Save>()
const props = defineProps<{
	saveId?: number
	savesPerPage: number
	open: boolean
}>()
const emit = defineEmits<{
	(event: 'closeModal', id: number, action: 'save' | 'cancel' | 'delete'): void
	(event: 'chooseBase'): void
}>()

const isNewSave = computed(() => {
	return !model.value || model.value!.createTime < 1
})

const saveChange = () => {
	if (model.value!.createTime < 1) {
		model.value!.createTime = Date.now()
	}
	model.value!.updateTime = Date.now()
	emit('closeModal', props.saveId!, 'save')
}

const cancel = () => {
	emit('closeModal', props.saveId!, 'cancel')
}

const deleteSave = () => {
	emit('closeModal', props.saveId!, 'delete')
}

// Hide modal temporarily to choose base save
const chooseBase = () => {
	emit('chooseBase')
}

const validateDecisionPoint = (decisionPoint: DecisionPointType) => {
	return decisionPoint.decision && decisionPoint.description
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
		})
	}
}

const handleRemoveDecisionPoint = (i: number) => {
	model.value?.decisionPoints?.splice(i - 1, 1)
}
</script>
