import { useEffect, useRef } from 'react'
import { Editor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEditor } from '@tiptap/react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleCommand = (command: string) => {
    if (!editor) return

    switch (command) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      case 'link':
        const url = window.prompt('Enter URL')
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
        break
      case 'image':
        const imageUrl = window.prompt('Enter image URL')
        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run()
        }
        break
    }
  }

  return (
    <div className="min-h-[200px] bg-white/5 rounded-lg p-4">
      <div className="prose prose-invert max-w-none">
        {editor?.isEditable ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="text-accent-silver/50">{placeholder}</div>
        )}
      </div>
    </div>
  )
} 