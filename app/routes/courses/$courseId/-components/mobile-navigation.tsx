import { Sheet, SheetContent } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";

interface Segment {
  id: string;
  title: string;
  courseId: string;
}

interface MobileNavigationProps {
  segments: Segment[];
  currentSegmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({
  segments,
  currentSegmentId,
  isOpen,
  onClose,
}: MobileNavigationProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-full max-w-[85vw] p-0 flex flex-col gap-0"
      >
        <div className="sticky top-0 right-0 flex items-center justify-between p-6 bg-background border-b z-10">
          <h2 className="text-lg font-semibold">Course Navigation</h2>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent/50"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close navigation</span>
          </Button>
        </div>
        <div className="divide-y divide-border overflow-y-auto flex-1">
          {segments.map((segment) => (
            <a
              key={segment.id}
              href={`/courses/${segment.courseId}/segments/${segment.id}`}
              className={`flex items-center gap-6 p-4 hover:bg-accent/50 transition-colors ${
                segment.id === currentSegmentId ? "bg-accent/50" : ""
              }`}
            >
              <div className="flex-shrink-0 size-10 flex items-center justify-center rounded-full bg-background border text-lg font-medium">
                {segment.id}
              </div>
              <span className="text-lg">{segment.title}</span>
            </a>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
