import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <p className="text-muted-foreground mb-8">The article you are looking for does not exist or has been moved.</p>
        <Link to="/blog" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${post.title} | Great Wildlife Photos Blog`}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.coverImage} />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to blog
          </Link>

          <div className="mb-8">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </div>

          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-72 md:h-96 object-cover rounded-2xl mb-12 shadow-lg"
          />

          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-4 prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-white prose-li:text-gray-300 prose-li:mb-2 prose-ul:my-6 prose-ul:pl-6 prose-hr:border-white/10 prose-hr:my-10 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:w-full prose-table:my-8 prose-thead:bg-white/5 prose-th:p-4 prose-th:text-left prose-th:text-white prose-th:font-semibold prose-th:border prose-th:border-white/10 prose-td:p-4 prose-td:border prose-td:border-white/10 prose-td:text-gray-300 prose-tr:border-b prose-tr:border-white/5">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="w-full overflow-x-auto my-8">
                    <table className="w-full border-collapse text-left" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-white/5" {...props} />,
                th: ({node, ...props}) => <th className="p-4 border border-white/10 text-white font-semibold text-left" {...props} />,
                td: ({node, ...props}) => <td className="p-4 border border-white/10 text-gray-300" style={{ minWidth: '120px' }} {...props} />,
                tr: ({node, ...props}) => <tr className="border-b border-white/5" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-white font-bold mt-10 mb-4 text-2xl" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-6" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-300 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="my-6 pl-6 list-disc" {...props} />,
                strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                hr: ({node, ...props}) => <hr className="border-white/10 my-10" {...props} />,
                a: ({node, ...props}) => <a className="text-primary no-underline hover:underline" {...props} />
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPostPage;