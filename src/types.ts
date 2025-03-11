export interface DecisionPoint {
	description: string
	decision: string
	options?: string[]
}

export interface Save {
	base?: number
	description?: string
	decisionPoints?: DecisionPoint[]
	createTime: number
	updateTime: number
}
