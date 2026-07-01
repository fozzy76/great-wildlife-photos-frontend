import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts.js';

const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>From the Field - Wildlife Photography Blog | Great Wildlife Photos</title>
        <meta name="description" content="Stories, guides, and moments from wildlife photographer Lynn Starnes." />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">From the Field</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stories, guides, and moments from Lynn Starnes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Link 
                key={post.slug} 
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full tracking-wide uppercase">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-2xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-muted-foreground mb-6 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-primary font-medium mt-auto">
                    Read more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;