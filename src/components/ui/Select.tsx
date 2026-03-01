import { cva } from '../../../styled-system/css'
import { styled } from '../../../styled-system/jsx'

const selectStyle = cva({
    base: {
        w: 'full',
        appearance: 'none',
        bg: 'bg.surface',
        borderWidth: '1px',
        borderColor: 'border.light',
        borderRadius: 'lg',
        color: 'text.main',
        fontFamily: 'body',
        transition: 'all 0.2s ease',
        px: '4',
        py: '2',
        fontSize: 'md',
        _focus: {
            outline: 'none',
            borderColor: 'brand.orange',
            boxShadow: '0 0 0 1px {colors.brand.orange}',
        },
        _disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    },
    variants: {
        variant: {
            outline: {},
            glass: {
                bg: 'bg.glass',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'white/30',
                shadow: 'sm',
                _focus: {
                    bg: 'brand.white',
                    borderColor: 'brand.orange',
                }
            }
        }
    },
    defaultVariants: {
        variant: 'outline',
    }
})

export const Select = styled('select', selectStyle)
