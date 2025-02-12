import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
  SidebarContent,
} from "~/components/ui/sidebar";
import { Course, Segment } from "~/db/schema";

interface DesktopNavigationProps {
  segments: Segment[];
  courseId: Course["id"];
  currentSegmentId: Segment["id"];
}

export function DesktopNavigation({
  segments,
  courseId,
  currentSegmentId,
}: DesktopNavigationProps) {
  return (
    <Sidebar className="fixed top-0 left-0 bottom-0 w-80 border-r">
      <SidebarContent className="pt-[4.5rem]">
        <div className="px-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium px-2 py-2 text-muted-foreground">
              Course Segments
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {segments.map((segment, index) => (
                  <SidebarMenuItem key={segment.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={segment.id === currentSegmentId}
                      className="rounded-md transition-colors w-full py-2 px-2 hover:bg-accent text-sm"
                    >
                      <a
                        href={`/courses/${courseId}/segments/${segment.id}`}
                        className="flex items-center gap-2 w-full"
                      >
                        <span className="flex-shrink-0 size-5 flex items-center justify-center rounded-full bg-muted font-medium text-xs">
                          {index + 1}
                        </span>
                        <span>{segment.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
