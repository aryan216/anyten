
// import prisma from '@/lib/db'
// import React from 'react'
import prisma from '@/lib/db';
import { caller, getQueryClient, trpc } from '@/trpc/server';
import { Client } from './client';
import { get } from 'http';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
const page = async() => {
  // const users= await caller.getUsers();
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());
 

  return (
    <div className='flex min-h-screen min-w-screen items-center justify-center'>
      <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
      <Client  />
      </Suspense>
      </HydrationBoundary>
    </div>
    
  )
}

export default page