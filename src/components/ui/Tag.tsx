import { cva } from '../../../styled-system/css'
import { styled } from '../../../styled-system/jsx'

const tagStyle = cva({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'full',
        fontWeight: '500',
        fontFamily: 'body',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
    },
    variants: {
        variant: {
            solid: {
                bg: 'brand.greyDark',
                color: 'brand.white',
            },
            subtle: {
                bg: 'brand.orangeLight',
                color: 'brand.orangeDark',
            },
            outline: {
                bg: 'transparent',
                borderWidth: '1px',
                borderColor: 'border.light',
                color: 'text.muted',
            },
            glass: {
                bg: 'bg.glass',
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                borderColor: 'white/40',
                shadow: 'sm',
                color: 'text.main',
                _hover: { bg: 'white/80' }
            }
        },
        size: {
            sm: { px: '2', py: '0.5', fontSize: 'xs' },
            md: { px: '3', py: '1', fontSize: 'sm' },
            lg: { px: '4', py: '1.5', fontSize: 'md' },
        }
    },
    defaultVariants: {
        variant: 'subtle',
        size: 'md',
    }
})

export const Tag = styled('div', tagStyle)
