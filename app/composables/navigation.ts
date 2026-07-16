export interface HeaderItem {
    text: string;
    active?: boolean;
    action?: () => void;
    path?: string;
    disabled?: boolean;
    hide?: boolean;
    width?: string;
    icon?: string;
    children?: Omit<HeaderItem, 'children' | 'minWidth'>[];
}

export const useHeaderMenu = () => computed<HeaderItem[]>(() => {
    const route = useRoute();
    const site = useSiteConfigState();

    const menu: HeaderItem[] = site.value.navigation.items.map(item => ({
        text: item.label,
        path: item.path,
        icon: item.icon ?? undefined,
    }));

    return menu.filter(x => !x.hide).map(x => {
        return {
            ...x,
            active: x.active ?? (x.path === route.path || !!x.children?.some(x => x.path === route.path)),
            children: x.children && x.children.map(x => ({
                ...x,
                active: x.active ?? x.path === route.path,
            })),
        } satisfies HeaderItem as HeaderItem;
    });
});
