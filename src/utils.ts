import { v4 as uuidv4 } from 'uuid'
import type { DecisionPoint, Option } from './types'

export const generateUuid = () => {
	return uuidv4()
}

export const validateDecisionPoint = (decisionPoint: DecisionPoint) => {
	return decisionPoint.decision.trim() && decisionPoint.description.trim()
}

export const validateOption = (option: Option) => {
	return !!option.value.trim()
}
