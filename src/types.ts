export interface Option {
	value: string
	uuid: string
}

export interface DecisionPoint {
	description: string
	decision: string
	options?: Option[]
	uuid: string
}

export interface Save {
	base?: number
	description?: string
	decisionPoints?: DecisionPoint[]
	createTime: number
	updateTime: number
}

export interface Data {
	max: number
	cols: number
	rows: number
	saves: Save[]
}

export type ExportedData = Omit<Data, 'saves'> & {
	saves: (Omit<Save, 'decisionPoints'> & {
		decisionPoints?: (Omit<DecisionPoint, 'uuid' | 'options'> & {
			options: string[]
		})[]
	})[]
}
