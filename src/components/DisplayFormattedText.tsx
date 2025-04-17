"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  content: string;
}

const DisplayFormattedText: React.FC<Props> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className = "", children, ...props }: any) {
          const match = /language-(\w+)/.exec(className);

          if (!inline && match) {
            const language = match[1];

            return (
              <div>
                <div className="pl-2 pb-4">{language}</div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={language}
                  customStyle={{
                    fontSize: '0.95rem',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          }

          // Inline code
          return <code {...props}>{children}</code>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default DisplayFormattedText;
