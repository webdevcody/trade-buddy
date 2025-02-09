import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";

interface Segment {
  id: string;
  title: string;
}

interface CourseSegmentsProps {
  segments: Segment[];
  currentSegmentId: string;
}

export function CourseSegments({
  segments,
  currentSegmentId,
}: CourseSegmentsProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Course Segments</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {segments.map((segment) => (
            <SidebarMenuItem key={segment.id}>
              <SidebarMenuButton
                asChild
                isActive={segment.id === currentSegmentId}
              >
                <a href={`/course/${segment.id}`}>{segment.title}</a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
