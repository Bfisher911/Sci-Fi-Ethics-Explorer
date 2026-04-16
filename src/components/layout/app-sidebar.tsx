
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  FlaskConical,
  BookText,
  Compass,
  MessageSquare,
  MessageCircle,
  FilePlus2,
  FileCheck,
  Users,
  Scale,
  User,
  Gem,
  Orbit,
  Building,
  PenTool,
  Trophy,
  Bookmark,
  GraduationCap,
  ScrollText,
  Presentation,
  ShieldCheck,
  GitCompare,
  Search,
  Rocket,
  Clapperboard,
  Newspaper,
  Award,
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
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';

const mainNavItems = [
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/analyzer', label: 'Scenario Analyzer', icon: FlaskConical },
  { href: '/glossary', label: 'Ethical Glossary', icon: BookText },
  { href: '/framework-explorer', label: 'Framework Explorer', icon: Compass },
  { href: '/ai-counselor', label: 'AI Counselor', icon: MessageSquare },
  { href: '/perspective-comparison', label: 'Perspectives', icon: GitCompare },
];

const communityNavItems = [
  { href: '/submit-dilemma', label: 'Submit Dilemma', icon: FilePlus2 },
  { href: '/my-submissions', label: 'My Submissions', icon: FileCheck },
  { href: '/community-dilemmas', label: 'Community Dilemmas', icon: Users },
  { href: '/community-stories', label: 'Community Stories', icon: BookOpen },
  { href: '/community-blog', label: 'Community Blog', icon: Newspaper },
  { href: '/debate-arena', label: 'Debate Arena', icon: Scale },
  { href: '/workshops', label: 'Workshops', icon: Presentation },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/create-story', label: 'Create Story', icon: PenTool },
];

const learningNavItems = [
  { href: '/textbook', label: 'Textbook', icon: BookText },
  { href: '/curriculum', label: 'Learning Paths', icon: GraduationCap },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/philosophers', label: 'Philosophers', icon: ScrollText },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/directory', label: 'Directory', icon: Users },
];

const scifiNavItems = [
  { href: '/scifi-authors', label: 'Sci-Fi Authors', icon: Rocket },
  { href: '/scifi-media', label: 'Sci-Fi Media', icon: Clapperboard },
];

const footerNavItems = [
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/pricing', label: 'Pricing & Plans', icon: Gem },
  { href: '/profile', label: 'Profile', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { claims } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/stories" className="flex items-center gap-2 font-semibold text-lg text-primary">
          <Orbit className="h-7 w-7" />
          {state === 'expanded' && <span>Sci-Fi Ethics</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 flex flex-col p-2">
        <div className="flex-grow space-y-1">
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/stories' && pathname.startsWith(item.href))}
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

          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-2 pb-1 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              Community & Teams
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
              {claims?.teamId && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/organizations')}
                    tooltip="My Organization"
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <Link href={`/organizations/${claims.teamId}`}>
                      <Building className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                      {state === 'expanded' && <span>My Organization</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="my-3" />

          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-2 pb-1 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              Learning
            </SidebarGroupLabel>
            <SidebarMenu>
              {learningNavItems.map((item) => (
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

          <SidebarSeparator className="my-3" />

          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-2 pb-1 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              Science Fiction
            </SidebarGroupLabel>
            <SidebarMenu>
              {scifiNavItems.map((item) => (
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
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/admin')}
                tooltip="Admin"
                className="group-data-[collapsible=icon]:justify-center"
              >
                <Link href="/admin">
                  <ShieldCheck className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                  {state === 'expanded' && <span>Admin</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
