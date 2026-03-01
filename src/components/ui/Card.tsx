import { cva } from '../../../styled-system/css'
import { styled } from '../../../styled-system/jsx'

const cardStyle = cva({
    base: {
        bg: 'bg.surface',
        borderRadius: '2xl', // Super soft edges for modern feel
        shadow: 'md',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
    },
    variants: {
        variant: {
            elevated: {
                shadow: 'lg',
            },
            glass: {
                bg: 'bg.glass',
                backdropFilter: 'blur(16px)',
                border: '1px solid',
                borderColor: 'white/40',
                shadow: 'glass',
            }
        }
    },
    defaultVariants: {
        variant: 'elevated',
    }
})

export const Card = styled('div', cardStyle)
export const CardHeader = styled('div', { base: { p: '4', pb: '2' } })
export const CardBody = styled('div', { base: { p: '4', py: '2', flex: '1' } })
export const CardFooter = styled('div', { base: { p: '4', pt: '2', display: 'flex', alignItems: 'center' } })
