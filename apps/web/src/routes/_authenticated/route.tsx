import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/shared/components/ui/sidebar'
import { LogoutButton } from '@/shared/components/logout-button'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
  type ToOptions,
} from '@tanstack/react-router'
import { Inbox, User, ToolCase } from 'lucide-react'
import { useStore } from '@/shared/store'
import { ProfileType } from '@/shared/lib/types'
import { RavnLogoShort } from '@/shared/components/logos/ravn-logo-short'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Save current location for redirect after login
          redirect: location.href,
        },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <RavnLogoShort className="fill-primary h-6 w-6 dark:fill-white" />
          <div className="flex items-center gap-2">
            <LogoutButton />
            <ThemeToggle className="-mr-1" />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

type MenuItem = {
  title: string
  to: ToOptions['to']
  icon: React.ComponentType
}

const adminMenuItems: MenuItem[] = [
  {
    title: 'Skills',
    to: '/admin/skills',
    icon: ToolCase,
  },
]

const menuItems: MenuItem[] = [
  {
    title: 'My Profile',
    to: '/profile',
    icon: User,
  },
]

function AppSidebar() {
  const currentUser = useStore((state) => state.currentUser)

  const getMenuItems = () => {
    switch (currentUser?.type) {
      case ProfileType.ADMIN:
        return adminMenuItems
      case ProfileType.TECH_LEAD:
        return [
          ...menuItems,
          {
            title: 'Inbox',
            to: '/validation-inbox',
            icon: Inbox,
          },
        ]
      default:
        return menuItems
    }
  }

  const items = getMenuItems()

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
