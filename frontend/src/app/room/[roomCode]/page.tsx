import React from 'react'
import Streams from '@/components/Streams';

function page() {
  return (
    <div className='flex flex-col justify-center items-center gap-8 p-24'>
      <h1 className='text-4xl font-sans font-bold tracking-tight'>Room</h1>

      <Streams />
    </div>
  )
}

export default page
