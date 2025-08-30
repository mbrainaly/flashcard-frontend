'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlusIcon, MinusIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ICard, CreateCardInput } from '@/types/card'
import Modal from '@/components/ui/Modal'

const cardSchema = z.object({
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
  hints: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

interface CardFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCardInput) => Promise<void>
  card?: ICard // Optional card for editing mode
  deckId: string
}

export default function CardFormModal({
  isOpen,
  onClose,
  onSubmit,
  card,
  deckId,
}: CardFormModalProps) {
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      front: card?.front || '',
      back: card?.back || '',
      hints: card?.hints || [''],
      examples: card?.examples || [''],
      tags: card?.tags || [''],
    },
  })

  const {
    fields: hintFields,
    append: appendHint,
    remove: removeHint,
  } = useFieldArray({
    control,
    name: 'hints',
  })

  const {
    fields: exampleFields,
    append: appendExample,
    remove: removeExample,
  } = useFieldArray({
    control,
    name: 'examples',
  })

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: 'tags',
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        front: card?.front || '',
        back: card?.back || '',
        hints: card?.hints?.length ? card.hints : [''],
        examples: card?.examples?.length ? card.examples : [''],
        tags: card?.tags?.length ? card.tags : [''],
      })
      setSelectedImage(null)
      setImagePreview(null)
      setError('')
    }
  }, [isOpen, card, reset])

  const handleClose = () => {
    reset()
    setSelectedImage(null)
    setImagePreview(null)
    setError('')
    onClose()
  }

  const handleFileSelect = (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported')
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size should be less than 5MB')
      return
    }
    setError('')
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleFormSubmit = async (data: CreateCardInput) => {
    try {
      setError('')
      const cleanedData = {
        ...data,
        hints: data.hints?.filter(Boolean),
        examples: data.examples?.filter(Boolean),
        tags: data.tags?.filter(Boolean),
        image: selectedImage || undefined
      }
      await onSubmit(cleanedData)
      handleClose()
    } catch (err) {
      setError('Failed to save card. Please try again.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={card ? 'Edit Card' : 'Create New Card'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4">
        {/* Front */}
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-white">
            Front
          </label>
          <div className="mt-1">
            <textarea
              {...register('front', { required: 'Front content is required' })}
              rows={4}
              className="block w-full rounded-md border-0 bg-white/90 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
              placeholder="Enter the front content of the card"
            />
            {errors.front && (
              <p className="mt-1 text-sm text-red-500">{errors.front.message}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-white">
            Image (optional)
          </label>
          <div
            className={`mt-1 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${
              isDragging ? 'border-accent-neon/60 bg-accent-neon/5' : 'border-accent-silver/30'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              const file = e.dataTransfer?.files?.[0]
              if (file) handleFileSelect(file)
            }}
            role="button"
            aria-label="Image dropzone"
          >
            <div className="text-center">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                    }}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <PhotoIcon className="mx-auto h-12 w-12 text-accent-silver" />
                  <div className="mt-4 flex text-sm leading-6 text-accent-silver">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-accent-neon hover:text-accent-neon/80"
                    >
                      <span>Upload an image</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-accent-silver">PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="mt-4">
          <label htmlFor="back" className="block text-sm font-medium text-white">
            Back
          </label>
          <div className="mt-1">
            <textarea
              {...register('back', { required: 'Back content is required' })}
              rows={4}
              className="block w-full rounded-md border-0 bg-white/90 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
              placeholder="Enter the back content of the card"
            />
            {errors.back && (
              <p className="mt-1 text-sm text-red-500">{errors.back.message}</p>
            )}
          </div>
        </div>

        {/* Hints */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white">Hints</label>
            <button
              type="button"
              onClick={() => appendHint('')}
              className="text-sm text-accent-neon hover:text-accent-neon/80"
            >
              Add Hint
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {hintFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`hints.${index}`)}
                  className="block w-full rounded-md border-0 bg-white/90 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                  placeholder="Enter a hint"
                />
                <button
                  type="button"
                  onClick={() => removeHint(index)}
                  className="rounded-md bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                  aria-label="Remove hint"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white">Examples</label>
            <button
              type="button"
              onClick={() => appendExample('')}
              className="text-sm text-accent-neon hover:text-accent-neon/80"
            >
              Add Example
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {exampleFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`examples.${index}`)}
                  className="block w-full rounded-md border-0 bg-white/90 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                  placeholder="Enter an example"
                />
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="rounded-md bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                  aria-label="Remove example"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white">Tags</label>
            <button
              type="button"
              onClick={() => appendTag('')}
              className="text-sm text-accent-neon hover:text-accent-neon/80"
            >
              Add Tag
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {tagFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`tags.${index}`)}
                  className="block w-full rounded-md border-0 bg-white/90 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                  placeholder="Enter a tag"
                />
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="rounded-md bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                  aria-label="Remove tag"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-accent-silver/10 px-4 py-2 text-accent-silver hover:bg-accent-silver/20"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-accent-neon px-4 py-2 text-black hover:bg-accent-neon/90"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{card ? 'Saving...' : 'Creating...'}</span>
              </div>
            ) : (
              <span>{card ? 'Save Changes' : 'Create Card'}</span>
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
} 