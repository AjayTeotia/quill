// src/types/simplebar-react.d.ts
declare module 'simplebar-react' {
    import * as React from 'react';

    interface SimpleBarProps extends React.HTMLAttributes<HTMLDivElement> {
        children?: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
        scrollableNodeProps?: React.HTMLAttributes<HTMLDivElement>;
        contentNodeProps?: React.HTMLAttributes<HTMLDivElement>;
        autoHide?: boolean;
        forceVisible?: boolean | 'x' | 'y';
    }

    class SimpleBar extends React.Component<SimpleBarProps> { }

    export default SimpleBar;
}
