interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <div className="mb-6">
      <video src={url} controls className="w-full max-w-3xl mx-auto">
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
