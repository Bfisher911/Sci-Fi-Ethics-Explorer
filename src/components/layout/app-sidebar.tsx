
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, // For Stories
  FlaskConical, // For Scenario Analyzer
  BookText, // For Ethical Glossary
  Compass, // For Framework Explorer
  MessageSquare, // For AI Counselor
  FilePlus2, // For Submit Dilemma
  Users, // For Community Dilemmas
  Scale, // For Debate Arena
  User, // For Profile
  Gem, // For Pricing & Plans
  Orbit, // For main Sci-Fi Ethics logo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
// Button is not used here directly unless we add a custom logout button

// Main navigation items
const mainNavItems = [
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/analyzer', label: 'Scenario Analyzer', icon: FlaskConical },
  { href: '/glossary', label: 'Ethical Glossary', icon: BookText },
  { href: '/framework-explorer', label: 'Framework Explorer', icon: Compass },
  { href: '/ai-counselor', label: 'AI Counselor', icon: MessageSquare },
];

// Community navigation items
const communityNavItems = [
  { href: '/submit-dilemma', label: 'Submit Dilemma', icon: FilePlus2 },
  { href: '/community-dilemmas', label: 'Community Dilemmas', icon: Users },
  { href: '/debate-arena', label: 'Debate Arena', icon: Scale },
];

// Footer navigation items
const footerNavItems = [
  { href: '/pricing', label: 'Pricing & Plans', icon: Gem },
  { href: '/profile', label: 'Profile', icon: User },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar(); // Get sidebar state (expanded/collapsed)

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/stories" className="flex items-center gap-2 font-semibold text-lg text-primary">
          <Orbit className="h-7 w-7" />
          {state === 'expanded' && <span>Sci-Fi Ethics</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 flex flex-col p-2"> {/* Added p-2 for consistent padding for groups */}
        <div className="flex-grow space-y-1"> {/* Main scrollable nav area */}
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className="group-data-[collapsible=icon]:justify-center"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                    {state === 'expanded' && <span>{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <SidebarSeparator className="my-3" />

          <SidebarGroup className="p-0"> {/* Group with no extra padding, label will have its own */}
            <SidebarGroupLabel className="px-2 pb-1 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              Community
            </SidebarGroupLabel>
            <SidebarMenu>
              {communityNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                      {state === 'expanded' && <span>{item.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
         <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className="group-data-[collapsible=icon]:justify-center"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                  {state === 'expanded' && <span>{item.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
