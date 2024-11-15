import Link from 'next/link'
import { getAllPosts } from '@/lib/markdown'
import Layout from '@/layouts/Layout'

export default function Home({ posts }) {
  return (
    <Layout title="Home">
      <div className="max-w-4xl mx-auto">
        <section className="mb-16">
          <h1 className="text-4xl font-bold mb-4">Welcome to TechBlog</h1>
          <p className="text-xl text-gray-600">Exploring the world of technology, one post at a time.</p>
        </section>

        <section className="space-y-12">
          {posts.map((post) => (
            <article 
              key={post.slug} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
            >
              <Link href={`/posts/${post.slug}`} className="block p-8">
                <div className="mb-4">
                  <time className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 hover:text-blue-600 transition">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                )}
                <div className="flex items-center">
                  <span className="text-blue-600 hover:text-blue-800">
                    Read more →
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </section>
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const posts = getAllPosts()
  return {
    props: { posts }
  }
}