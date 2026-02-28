import { cva } from '../../../styled-system/css'
import { styled } from '../../../styled-system/jsx'

const avatarStyle = cva({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'full',
        bg: 'brand.orangeLight',
        color: 'brand.orangeDark',
        fontWeight: 'bold',
        fontFamily: 'heading',
        overflow: 'hidden',
    },
    variants: {
        size: {
            sm: { w: '8', h: '8', fontSize: 'xs' },
            md: { w: '10', h: '10', fontSize: 'sm' },
            lg: { w: '12', h: '12', fontSize: 'md' },
        }
    },
    defaultVariants: {
        size: 'md',
    }
})

export const Avatar = styled('div', avatarStyle)
export const AvatarImage = styled('img', {
    base: {
        w: 'full',
        h: 'full',
        objectFit: 'cover',
    }
})
