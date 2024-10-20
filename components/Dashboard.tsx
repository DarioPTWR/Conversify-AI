'use client'

import { trpc } from '@/app/_trpc/client'
import Link from 'next/link'
import { Button } from './ui/button'
import { useState } from 'react'
import UploadButton from './UploadButton'
// import { map } from '@trpc/server/observable'
// import { count } from 'console'
import { Plus, MessageSquare, Loader2, Trash, Ghost } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import {format} from "date-fns"

const Dashboard = () => {
  const utils = trpc.useContext()

  const [currentlyDeletingFile, setCurrentlyDeletingFile] =
    useState<string | null>(null)

  const { data: files, isLoading } =
    trpc.getUserFiles.useQuery()

  const { mutate: deleteFile } =
    trpc.deleteFile.useMutation({
      onSuccess: () => {
        utils.getUserFiles.invalidate()
      },
      onMutate({ id }) {
        setCurrentlyDeletingFile(id)
      },
      onSettled() {
        setCurrentlyDeletingFile(null)
      },
    })


  return (
    <main className='mx-auto max-w-7xl md:p-10 sm:px-0 px-4 mb-4 sm:mb-0'>
      <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row items-center sm:gap-0'>
        <h1 className='mb-3 font-bold text-4xl sm:text-5xl text-gray-900'>
          My Files
        </h1>

        <UploadButton />
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                {/* Link to file */}
                <Link href={`/dashboard/${file.id}`} className="flex flex-col items-center p-4">
                  {/* Circular Icon */}
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-4" />
                  
                  {/* File Name */}
                  <h3 className="truncate text-lg font-medium text-zinc-900 px-2 text-center mb-2 max-w-full">
                    {file.name}
                  </h3>
                </Link>

                {/* File Details */}
                <div className="flex-1 p-4 flex flex-col justify-between text-sm text-zinc-500 space-y-4">
                  {/* File Creation Date */}
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), 'MMM yyyy')}
                  </div>

                  {/* Chat Option */}
                  <div className="flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Start Chat
                  </div>

                  {/* Delete Button */}
                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size="sm"
                    className="w-full"
                    variant="destructive"
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className='my-2' count={3} />
      ) : (
        <div className='mt-16 flex flex-col items-center gap-2'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>
            Pretty empty around here
          </h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  )
}

export default Dashboard