export default function VideoDemo() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/50 to-zinc-900/0 z-10" />
      
      {/* Video Thumbnail/Preview */}
      <div className="aspect-[16/10] relative">
        <video
          className="w-full h-full object-cover"
          poster="/demo-thumbnail.jpg"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Optional Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="rounded-full bg-white/10 backdrop-blur-sm p-4 cursor-pointer hover:bg-white/20 transition-colors">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Browser Frame */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-800/80 backdrop-blur flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 text-center px-2">
            <div className="bg-zinc-700/50 w-full  rounded-md text-xs text-zinc-300 py-0.5 px-2 inline-block">
              demo.traftics.com
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 