import { Link } from "@tanstack/react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon: string;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}

export function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            defaultOpen={item.isActive}
            key={item.title}
            render={
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link to={item.url}>
                      <span className={cn("text-base", item.icon)} />
                      <span>{item.title}</span>
                    </Link>
                  }
                />

                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <span className="i-hugeicons-arrow-right-01" />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            }
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
