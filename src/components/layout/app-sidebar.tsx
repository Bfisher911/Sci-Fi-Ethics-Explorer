'use client';

/**
 * Sidebar — 6 top-level sections with collapsible disclosure.
 *
 *   Home          (single link to /dashboard)
 *   Learn         Textbook · Learning Paths · Master Exam · Certificates
 *   Practice      Stories · Scenario Analyzer · Framework Explorer · Perspectives · AI Counselor
 *   Community     Dilemmas · Debates · Workshops · Communities · Directory · Messages
 *   Library       Philosophers · Theories · Sci-Fi Authors · Sci-Fi Media · Glossary · Blog
 *   Admin         (only when isAdmin OR license-admin) — single link to /admin hub
 *
 * Bookmarks and Pricing previously lived in the footer nav; they're now in
 * the user-menu dropdown (see app-header.tsx). Submit Dilemma + My
 * Submissions are dropped from the main nav — both surfaces live as tabs
 * inside /community-dilemmas.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  BookText,
  Compass,
  Home,
  MessageCircle,
  Users,
  Scale,
  Orbit,
  Building,
  Trophy,
  GraduationCap,
  ScrollText,
  Presentation,
  ShieldCheck,
  Rocket,
  Clapperboard,
  Newspaper,
  Award,
  ChevronRight,
  Library,
  Layers,
  Microscope,
  Sparkles,
  type LucideIcon,
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
import { hasOwnedLicenses } from '@/app/actions/scope';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  /** When set, the section header itself is a link (no children). */
  href?: string;
  items?: NavItem[];
}

const SECTIONS: NavSection[] = [
  // Section 1 — Home (no children)
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/dashboard',
  },
  // Section 2 — Learn
  {
    id: 'learn',
    label: 'Learn',
    icon: GraduationCap,
    items: [
      { href: '/textbook', label: 'Textbook', icon: BookText },
      { href: '/curriculum', label: 'Learning Paths', icon: Layers },
      { href: '/master-exam', label: 'Master Exam', icon: Trophy },
      { href: '/certificates', label: 'Certificates', icon: Award },
    ],
  },
  // Section 3 — Practice. The four AI surfaces (Counselor / Analyzer /
  // Perspectives / Reflection) consolidated into a single `/studio`
  // route with tab modes; one sidebar entry, four tools.
  {
    id: 'practice',
    label: 'Practice',
    icon: Microscope,
    items: [
      { href: '/stories', label: 'Stories', icon: BookOpen },
      { href: '/framework-explorer', label: 'Framework Explorer', icon: Compass },
      { href: '/studio', label: 'Studio (AI tools)', icon: Sparkles },
    ],
  },
  // Section 4 — Community
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    items: [
      { href: '/community-dilemmas', label: 'Dilemmas', icon: BookOpen },
      { href: '/debate-arena', label: 'Debates', icon: Scale },
      { href: '/workshops', label: 'Workshops', icon: Presentation },
      { href: '/communities', label: 'Communities', icon: Users },
      { href: '/directory', label: 'Directory', icon: Users },
      { href: '/messages', label: 'Messages', icon: MessageCircle },
    ],
  },
  // Section 5 — Library
  {
    id: 'library',
    label: 'Library',
    icon: Library,
    items: [
      { href: '/philosophers', label: 'Philosophers', icon: ScrollText },
      { href: '/glossary', label: 'Ethical Frameworks', icon: BookText },
      { href: '/scifi-authors', label: 'Sci-Fi Authors', icon: Rocket },
      { href: '/scifi-media', label: 'Sci-Fi Media', icon: Clapperboard },
      { href: '/blog', label: 'Blog', icon: Newspaper },
      { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ],
  },
];

/** localStorage key for which sections are expanded. */
const SECTION_OPEN_KEY = 'sfe.sidebarSectionsOpen';

function isPathInSection(section: NavSection, pathname: string): boolean {
  if (section.href && pathname === section.href) return true;
  if (!section.items) return false;
  return section.items.some(
    (it) => pathname === it.href || pathname.startsWith(it.href + '/'),
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user, claims } = useAuth();
  const { isAdmin } = useAdmin();
  const [licenseAdmin, setLicenseAdmin] = useState<boolean | null>(null);

  // Detect whether this user owns at least one license — gates the
  // Admin entry for license-admins (who don't have isAdmin === true)
  // and is also used by the user-menu to gate the Billing link.
  useEffect(() => {
    if (!user) {
      setLicenseAdmin(false);
      return;
    }
    let cancelled = false;
    hasOwnedLicenses(user.uid).then((res) => {
      if (cancelled) return;
      setLicenseAdmin(res.success ? res.data : false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const showAdmin = Boolean(isAdmin || licenseAdmin);

  // Restore section-open state from localStorage; auto-open the section
  // that matches the current path so the user always sees where they are.
  const initialOpen = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, boolean>;
    try {
      const stored = JSON.parse(localStorage.getItem(SECTION_OPEN_KEY) || '{}');
      return stored as Record<string, boolean>;
    } catch {
      return {};
    }
  }, []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpen);

  // Open the section that contains the current page (don't close other
  // sections the user has explicitly opened).
  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const s of SECTIONS) {
        if (isPathInSection(s, pathname)) next[s.id] = true;
      }
      return next;
    });
  }, [pathname]);

  // Persist whenever changed.
  useEffect(() => {
    try {
      localStorage.setItem(SECTION_OPEN_KEY, JSON.stringify(openSections));
    } catch {
      // ignore — quota / disabled storage
    }
  }, [openSections]);

  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-lg text-primary"
        >
          <Orbit className="h-7 w-7" />
          {!collapsed && <span>Sci-Fi Ethics</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 flex flex-col p-2">
        <div className="flex-grow space-y-1">
          {SECTIONS.map((section) => {
            // Single-link section (Home).
            if (section.href && !section.items) {
              const active = pathname === section.href;
              return (
                <SidebarMenu key={section.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={section.label}
                      className="group-data-[collapsible=icon]:justify-center"
                    >
                      <Link href={section.href}>
                        <section.icon className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                        {!collapsed && <span>{section.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              );
            }

            const isOpen = openSections[section.id] ?? isPathInSection(section, pathname);
            const sectionActive = isPathInSection(section, pathname);

            // When collapsed (icon-only), render section items as a flat
            // list so the user still sees them on hover. Disclosure
            // animation only matters when expanded.
            if (collapsed) {
              return (
                <SidebarMenu key={section.id}>
                  {section.items?.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          pathname === item.href ||
                          pathname.startsWith(item.href + '/')
                        }
                        tooltip={`${section.label} · ${item.label}`}
                        className="group-data-[collapsible=icon]:justify-center"
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              );
            }

            return (
              <div key={section.id} className="mt-1">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections((prev) => ({
                      ...prev,
                      [section.id]: !(prev[section.id] ?? sectionActive),
                    }))
                  }
                  aria-expanded={isOpen}
                  aria-controls={`sidebar-section-${section.id}`}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors',
                    'hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground',
                    sectionActive
                      ? 'text-sidebar-foreground'
                      : 'text-sidebar-foreground/85',
                  )}
                >
                  <section.icon className="h-4 w-4 text-primary/80" />
                  <span className="flex-1 text-left">{section.label}</span>
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      isOpen && 'rotate-90',
                    )}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`sidebar-section-${section.id}`}
                    className="mt-0.5 ml-1 border-l border-sidebar-border/60 pl-2"
                  >
                    <SidebarMenu>
                      {section.items?.map((item) => {
                        const active =
                          pathname === item.href ||
                          pathname.startsWith(item.href + '/');
                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              asChild
                              isActive={active}
                              tooltip={item.label}
                              className="text-[13px]"
                            >
                              <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </div>
                )}
              </div>
            );
          })}

          {claims?.teamId && (
            <SidebarMenu className="mt-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/organizations')}
                  tooltip="My Organization"
                  className="group-data-[collapsible=icon]:justify-center"
                >
                  <Link href={`/organizations/${claims.teamId}`}>
                    <Building className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                    {!collapsed && <span>My Organization</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </div>
      </SidebarContent>

      {/* Section 6 — Admin. Only renders when the user is a platform
          admin OR a license-admin (owns at least one active license).
          The header itself stays hidden for everyone else. */}
      {showAdmin && (
        <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/admin')}
                tooltip="Admin"
                className="group-data-[collapsible=icon]:justify-center"
              >
                <Link href="/admin">
                  <ShieldCheck className="h-5 w-5 group-data-[collapsible=icon]:m-auto text-primary" />
                  {!collapsed && <span>Admin</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
