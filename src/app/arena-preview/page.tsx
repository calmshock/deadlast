import ArenaScenePreview from "@/components/deadlast/animated-arena/ArenaScenePreview";
import ArenaLivePreview from "@/components/deadlast/animated-arena/ArenaLivePreview";

export default function ArenaPreviewPage() {
  return (
    <main className="min-h-screen space-y-6 bg-black p-4">
      <ArenaLivePreview />
      <ArenaScenePreview />
    </main>
  );
}
