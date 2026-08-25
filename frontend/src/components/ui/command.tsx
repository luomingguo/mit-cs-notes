import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn('flex h-full w-full flex-col overflow-hidden', className)} {...props} />;
}

export function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4" cmdk-input-wrapper="">
      <Search className="size-4 shrink-0 text-faint" />
      <CommandPrimitive.Input
        className={cn('h-14 w-full bg-transparent pr-9 text-[15px] outline-none placeholder:text-muted-foreground', className)}
        {...props}
      />
    </div>
  );
}

export const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={cn('max-h-[50vh] overflow-y-auto p-2', className)} {...props} />
));
CommandList.displayName = 'CommandList';

export function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-10 text-center text-sm text-muted-foreground" {...props} />;
}

export function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn('text-foreground', className)} {...props} />;
}

export function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn('relative flex cursor-default select-none items-center rounded-lg px-3 py-2.5 outline-none data-[selected=true]:bg-secondary', className)}
      {...props}
    />
  );
}
