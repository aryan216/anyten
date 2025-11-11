import prisma from '@/lib/db'
import React from 'react'

const page = async() => {
  const users= await prisma.user.findMany();

  return (
    <div className='flex min-h-screen min-w-screen items-center justify-center'>{JSON.stringify(users)}</div>
    
  )
}

export default page