'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Library,
  FlaskConical,
  BookText,
  Puzzle,
  BrainCircuit,
  PlusSquare,
  Users,
  Sword, // MessagesSquare could also work for Debate Arena
  User,
  CreditCard,
  Settings, // Generic icon for settings or other items
  Gavel, // Icon for ethical dilemmas or rules
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
} from '@/components/ui/sidebar'; // Assuming these are correctly exported from shadcn sidebar
import { Button } from '../ui/button';

const navItems = [
  { href: '/stories', label: 'Stories', icon: Library },
  { href: '/analyzer', label: 'Scenario Analyzer', icon: FlaskConical },
  { href: '/glossary', label: 'Ethical Glossary', icon: BookText },
  { href: '/framework-explorer', label: 'Framework Explorer', icon: Puzzle },
  { href: '/ai-counselor', label: 'AI Counselor', icon: BrainCircuit },
  { href: '/submit-dilemma', label: 'Submit Dilemma', icon: PlusSquare },
  { href: '/community-dilemmas', label: 'Community Dilemmas', icon: Users },
  { href: '/debate-arena', label: 'Debate Arena', icon: Sword },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, state } = useSidebar(); // Get sidebar state

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/stories" className="flex items-center gap-2 font-semibold text-lg">
          <Gavel className="h-7 w-7 text-primary" />
          {state === 'expanded' && <span>Sci-Fi Ethics</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* Optional: Add settings or other footer items */}
         {/* <Button variant="ghost" className={cn("w-full justify-start gap-2", state === 'collapsed' && "justify-center")}>
          <Settings className="h-5 w-5" />
          {state === 'expanded' && <span>Settings</span>}
        </Button> */}
      </SidebarFooter>
    </Sidebar>
  );
}
