'use client'
import { Book, TrendingUp } from 'lucide-react'
import { CartesianGrid, Label, Line, LineChart, ReferenceArea, XAxis, YAxis } from 'recharts'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { data } from './data'
import { transform } from 'next/dist/build/swc'
const initialData = data.toSorted((a, b) => a.km - b.km)

const chartConfig = {
	desktop: {
		label: 'Desktop',
		color: 'hsl(var(--chart-1))',
	},
	mobile: {
		label: 'Mobile',
		color: 'hsl(var(--chart-2))',
	},
} satisfies ChartConfig

const getAxisYDomain = (
	refFrom: string,
	refTo: string,
	ref: keyof (typeof initialData)[0],
	offset: number
) => {
	const from = initialData.findIndex(d => d.km === Number(refFrom))
	const to = initialData.findIndex(d => d.km === Number(refTo)) + 1
	const refData = initialData.slice(from, to)
	let [bottom, top] = [refData[0][ref], refData[0][ref]]
	refData.forEach(d => {
		if (d[ref] > top) top = d[ref]
		if (d[ref] < bottom) bottom = d[ref]
	})

	return [(Number(bottom) | 0) - offset, (Number(top) | 0) + offset]
}

const initialState: {
	data: typeof initialData
	left: string | number
	right: string | number
	areaLeft: string
	areaRight: string
	top: string | number
	bottom: string | number
	top2: string | number
	bottom2: string | number
} = {
	data: initialData,
	left: 'dataMin',
	right: 'dataMax',
	areaLeft: '',
	areaRight: '',
	top: 'dataMax+5',
	bottom: 'dataMin-5',
	top2: 'dataMax+5',
	bottom2: 'dataMin-5',
}

function ZoomChart() {
	const [data, setData] = useState(initialState.data)
	const [left, setLeft] = useState(initialState.left)
	const [right, setRight] = useState(initialState.right)
	const [areaLeft, setAreaLeft] = useState(initialState.areaLeft)
	const [areaRight, setAreaRight] = useState(initialState.areaRight)
	const [top, setTop] = useState(initialState.top)
	const [bottom, setBottom] = useState(initialState.bottom)
	const [top2, setTop2] = useState(initialState.top2)
	const [bottom2, setBottom2] = useState(initialState.bottom2)

	const refAreaLeft = useRef<string>()
	const refAreaRight = useRef<string>()

	const zoom = () => {
		let areaLeft = refAreaLeft.current ?? ''
		let areaRight = refAreaRight.current ?? ''

		if (areaLeft === areaRight || areaRight === '') {
			setAreaLeft('')
			setAreaRight('')
			refAreaLeft.current = ''
			refAreaRight.current = ''
			return
		}

		// xAxis domain
		if (areaLeft > areaRight) [areaLeft, areaRight] = [areaRight, areaLeft]

		// yAxis domain
		const [bottom, top] = getAxisYDomain(areaLeft, areaRight, 'PositionY', 1)
		const [bottom2, top2] = getAxisYDomain(areaLeft, areaRight, 'PositionX', 1)

		setAreaLeft('')
		setAreaRight('')
		setData(data.slice())
		setLeft(areaLeft)
		setRight(areaRight)
		setBottom(bottom)
		setTop(top)
		setBottom2(bottom2)
		setTop2(top2)
		refAreaLeft.current = ''
		refAreaRight.current = ''
	}

	const zoomOut = () => {
		setData(initialState.data.slice())
		setLeft(initialState.left)
		setRight(initialState.right)
		setAreaLeft(initialState.areaLeft)
		setAreaRight(initialState.areaRight)
		setTop(initialState.top)
		setBottom(initialState.bottom)
		setTop2(initialState.top2)
		setBottom2(initialState.bottom2)
		refAreaLeft.current = ''
		refAreaRight.current = ''
	}

	// const applyDefault = (default :string) => {
	// 	if ()
	// }

	return (
		<Card>
			<CardHeader>
				<CardTitle>Demo grafico a linea</CardTitle>
				<CardDescription>
					Data acquisizione: {new Date(initialData[0].Date).toLocaleDateString()}
				</CardDescription>
				<Button onClick={zoomOut}>Zoom out</Button>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<LineChart
						className='select-none'
						// accessibilityLayer
						data={data}
						margin={{
							top: 20,
							right: 80,
							bottom: 20,
							left: 20,
						}}
						onMouseDown={e => {
							setAreaLeft(e.activeLabel ?? '')
							setAreaRight('')
							refAreaLeft.current = e.activeLabel ?? ''
						}}
						onMouseMove={e => {
							if (refAreaLeft.current) {
								setAreaRight(e.activeLabel ?? '')
								refAreaRight.current = e.activeLabel ?? ''
							}
						}}
						onMouseUp={e => {
							if (refAreaLeft.current) {
								refAreaRight.current = e.activeLabel ?? ''
								zoom()
							}
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey='km'
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={value => value}
							allowDataOverflow
							domain={[left, right]}
							type='number'
							label={{
								value: 'Km percorsi',
								position: 'insideBottomRight',
								offset: 0,
								dy: 10,
							}}
						/>

						<YAxis
							allowDataOverflow
							domain={[bottom, top]}
							type='number'
							yAxisId='1'
							label={{
								value: 'Posizione Y',
								position: 'insideRight',
								offset: 0,
								dx: -65.72,
								angle: -270,
							}}
						/>

						<YAxis
							orientation='right'
							allowDataOverflow
							domain={[bottom2, top2]}
							type='number'
							yAxisId='2'
							label={{
								value: 'Posizione X',
								position: 'insideRight',
								offset: 0,
								angle: -270,
							}}
						/>
						<ChartTooltip cursor={true} content={<ChartTooltipContent />} />
						<Line
							dataKey='PositionY'
							type='monotone'
							stroke='var(--color-desktop)'
							strokeWidth={2}
							dot={false}
							yAxisId='1'
						/>
						<Line
							dataKey='PositionX'
							type='monotone'
							stroke='var(--color-mobile)'
							strokeWidth={2}
							dot={false}
							yAxisId='2'
						/>

						<ReferenceArea
							yAxisId={areaLeft && areaRight ? '2' : undefined}
							x1={areaLeft}
							x2={areaRight}
							strokeOpacity={0.3}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className='flex w-full items-start gap-2 text-sm'>
					<div className='grid gap-2'>
						<div className='flex items-center gap-2 font-medium leading-none'>
							<Book /> Istruzioni di utlizzo
						</div>
						<div className='flex items-center gap-2 leading-none text-muted-foreground'>
							Clicca e selziona un'area da zoomare. Clicca su "Zoom out" per tornare al grafico
							originale.
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	)
}

export default ZoomChart
