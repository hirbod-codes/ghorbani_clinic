import { CircularLoadingIcon } from "../CircularLoadingIcon";

export function CircularLoading({ size = 'md' }: { size?: 'xl' | 'lg' | 'md' | 'sm' | 'xs' }) {
    let className = ''
    switch (size) {
        case 'xl':
            className += `size-16`
            break;
        case 'lg':
            className += `size-14`
            break;
        case 'md':
            className += `size-11`
            break;
        case 'sm':
            className += `size-8`
            break;
        case 'xs':
            className += `size-6`
            break;

        default:
            break;
    }

    return (
        <div className={className}>
            <CircularLoadingIcon />
        </div>
    )
}

