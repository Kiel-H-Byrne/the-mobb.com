import { cva } from '../../../styled-system/css'
import { styled } from '../../../styled-system/jsx'

const buttonStyle = cva({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'full', // Community-oriented, approachable soft corners
        fontWeight: '600',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        fontFamily: 'heading',
        _disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    },
    variants: {
        variant: {
            solid: {
                bg: 'brand.orange',
                color: 'brand.white',
                _hover: { bg: 'brand.orangeDark' },
            },
            outline: {
                bg: 'transparent',
                borderWidth: '2px',
                borderColor: 'brand.orange',
                color: 'brand.orange',
                _hover: { bg: 'brand.orangeLight' },
            },
            ghost: {
                bg: 'transparent',
                color: 'text.main',
                _hover: { bg: 'bg.canvas' },
            },
            glass: {
                bg: 'bg.glass',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'white/30',
                shadow: 'glass',
                color: 'text.main',
                _hover: { bg: 'white/90' },
            }
        },
        size: {
            sm: { px: '3', py: '1.5', fontSize: 'sm' },
            md: { px: '4', py: '2', fontSize: 'md' },
            lg: { px: '6', py: '3', fontSize: 'lg' },
            icon: { w: '10', h: '10', p: '0' },
        }
    },
    defaultVariants: {
        variant: 'solid',
        size: 'md',
    }
})

export const Button = styled('button', buttonStyle)
