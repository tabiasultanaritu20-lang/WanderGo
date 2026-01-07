import React, { useState } from "react";
import { MapPin, Calendar, ThumbsUp, MessageCircle, Share2, User } from "lucide-react";

const BlogCard = ({ blog }) => {
  const [loaded, setLoaded] = useState({});

  const {
    title,
    authorName,
    location,
    categories = [],
    tags = [],
    coverImageUrl,
    images = [],
    createdAt,
  } = blog;

  const textContent = blog.content || blog.body || "";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "Recently";

  const shortContent =
    textContent && textContent.length > 150 ? textContent.slice(0, 150) + "..." : textContent || "No content yet.";

  const categoryList = [...(categories || []), ...(tags || [])];

  const allImages = [
    ...(coverImageUrl ? [coverImageUrl] : []),
    ...(images || []),
  ].filter(Boolean);

  const uniqImages = Array.from(new Set(allImages));

  const handleLike = (e) => { e.stopPropagation(); console.log("Like clicked", blog._id); };
  const handleComment = (e) => { e.stopPropagation(); console.log("Comment clicked", blog._id); };
  const handleShare = (e) => { e.stopPropagation(); console.log("Share clicked", blog._id); };

  return (
    <article className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300">
      {/* Images */}
      {uniqImages.length > 0 && (
        <div className="bg-slate-200">
          {/* Main image */}
          <div className="relative h-56 overflow-hidden">
            {!loaded[uniqImages[0]] && (
              <div className="absolute inset-0 bg-slate-200 animate-pulse z-0" />
            )}
            <img
              src={uniqImages[0]}
              alt={title}
              onLoad={() => setLoaded((p) => ({ ...p, [uniqImages[0]]: true }))}
              loading="lazy"
              className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-in-out relative z-10 ${
                loaded[uniqImages[0]] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
          </div>

          {/* Thumbnails */}
          {uniqImages.length > 1 && (
            <div className="p-3 grid grid-cols-4 gap-2 bg-white border-t border-slate-100">
              {uniqImages.slice(1, 5).map((src, idx) => (
                <div key={src + idx} className="relative aspect-square overflow-hidden rounded-xl bg-slate-200">
                  {!loaded[src] && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
                  <img
                    src={src}
                    alt={`${title} ${idx + 2}`}
                    loading="lazy"
                    onLoad={() => setLoaded((p) => ({ ...p, [src]: true }))}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      loaded[src] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              ))}
              {uniqImages.length > 5 && (
                <div className="text-xs text-slate-500 flex items-center justify-center">
                  +{uniqImages.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
              {authorName ? authorName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                {authorName || "Anonymous"}
              </p>
              <div className="flex items-center text-xs text-slate-500 gap-2">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {location && (
            <div className="flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3 mr-1" />
              {location}
            </div>
          )}
        </div>

        <div className="mb-4 flex-grow">
          <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">{shortContent}</p>
        </div>

        {categoryList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categoryList.slice(0, 3).map((cat, index) => (
              <span
                key={`${cat}-${index}`}
                className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200"
              >
                {cat}
              </span>
            ))}
            {categoryList.length > 3 && (
              <span className="text-[10px] font-semibold px-2 py-1 text-slate-400">
                +{categoryList.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="border-t border-slate-100 my-0"></div>
      </div>

      <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between mt-auto">
        <button onClick={handleLike} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group/btn">
          <ThumbsUp className="w-4 h-4 group-hover/btn:-rotate-12 transition-transform" />
          <span>Like</span>
        </button>

        <button onClick={handleComment} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group/btn">
          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span>Comment</span>
        </button>

        <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group/btn">
          <Share2 className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
};

export default BlogCard;
