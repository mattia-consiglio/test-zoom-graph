import Image from 'next/image'
import ZoomChart from './ZoomChart'

export default function Home() {
	return (
		<main className='container mx-auto p-4'>
			<ZoomChart />
		</main>
	)
}
