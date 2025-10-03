import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IDeck } from '@/types/deck'

const deckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot be more than 100 characters'),
  description: z.string().max(500, 'Description cannot be more than 500 characters').optional(),
  tags: z.array(z.string()).optional(),
})

type DeckFormData = z.infer<typeof deckSchema>

interface DeckFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DeckFormData) => Promise<void>
  deck?: IDeck
}

export default function DeckFormModal({ isOpen, onClose, onSubmit, deck }: DeckFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      title: deck?.title || '',
      description: deck?.description || '',
      tags: deck?.tags || [],
    },
  })

  const onSubmitHandler = async (data: DeckFormData) => {
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error submitting deck:', error)
      // TODO: Show error toast
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-accent-obsidian p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                  {deck ? 'Edit Deck' : 'Create New Deck'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmitHandler)} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-accent-silver">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-accent-silver/10 px-3 py-2 text-white placeholder-accent-silver/50 focus:border-accent-neon focus:outline-none focus:ring-1 focus:ring-accent-neon"
                      placeholder="Enter deck title"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-accent-silver">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-accent-silver/10 px-3 py-2 text-white placeholder-accent-silver/50 focus:border-accent-neon focus:outline-none focus:ring-1 focus:ring-accent-neon"
                      placeholder="Enter deck description"
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>


                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-accent-silver hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-accent-neon px-4 py-2 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : deck ? 'Save Changes' : 'Create Deck'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 