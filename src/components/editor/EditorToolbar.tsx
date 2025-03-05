import { motion } from 'framer-motion'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  ListNumberedIcon,
  Heading1Icon,
  Heading2Icon,
  CodeIcon,
  LinkIcon,
  ImageIcon,
} from '@/components/icons'

interface ToolbarButton {
  id: string
  icon: typeof BoldIcon
  label: string
  command: string
}

const toolbarButtons: ToolbarButton[] = [
  { id: 'bold', icon: BoldIcon, label: 'Bold', command: 'bold' },
  { id: 'italic', icon: ItalicIcon, label: 'Italic', command: 'italic' },
  { id: 'underline', icon: UnderlineIcon, label: 'Underline', command: 'underline' },
  { id: 'h1', icon: Heading1Icon, label: 'Heading 1', command: 'heading1' },
  { id: 'h2', icon: Heading2Icon, label: 'Heading 2', command: 'heading2' },
  { id: 'bullet-list', icon: ListBulletIcon, label: 'Bullet List', command: 'bulletList' },
  { id: 'numbered-list', icon: ListNumberedIcon, label: 'Numbered List', command: 'orderedList' },
  { id: 'code', icon: CodeIcon, label: 'Code', command: 'code' },
  { id: 'link', icon: LinkIcon, label: 'Link', command: 'link' },
  { id: 'image', icon: ImageIcon, label: 'Image', command: 'image' },
]

interface EditorToolbarProps {
  onCommand?: (command: string) => void
}

export default function EditorToolbar({ onCommand }: EditorToolbarProps) {
  const handleCommand = (command: string) => {
    if (onCommand) {
      onCommand(command)
    }
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white/5 rounded-lg">
      {toolbarButtons.map((button) => {
        const Icon = button.icon
        
        return (
          <motion.button
            key={button.id}
            onClick={() => handleCommand(button.command)}
            className="p-2 text-accent-silver hover:text-white hover:bg-white/5 rounded-md transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={button.label}
          >
            <Icon className="h-4 w-4" />
          </motion.button>
        )
      })}
    </div>
  )
} 