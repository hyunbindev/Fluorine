import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownPreview({ source, excerpt = false }: { source: string; excerpt?: boolean }) {
  return (
    <div className={`select-text space-y-3 wrap-anywhere text-sm leading-relaxed text-shell-foreground [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-menu-accent/50 [&_blockquote]:pl-3 [&_pre]:rounded-lg [&_pre]:bg-chrome-solid [&_pre]:p-3 [&_code]:font-mono [&_a]:text-menu-active [&_a]:underline [&_table]:block [&_:is(th,td)]:border [&_:is(th,td)]:border-white/15 [&_:is(th,td)]:px-2 ${excerpt ? 'line-clamp-6 [&_pre]:whitespace-pre-wrap [&_table]:[display:table]' : '[&_pre]:overflow-x-auto [&_table]:overflow-x-auto'}`}>
      <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{
        img: ({ alt }) => <span>{alt}</span>,
        a: ({ children, href }) => excerpt ? <span>{children}</span> : <a href={href} target="_blank" rel="noreferrer">{children}</a>,
      }}>{source}</Markdown>
    </div>
  )
}
