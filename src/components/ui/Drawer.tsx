import { Dialog as ArkDialog } from '@ark-ui/react/dialog'
import { styled } from '@styled/jsx'

export const Drawer = ArkDialog.Root
export const DrawerTrigger = ArkDialog.Trigger

export const DrawerBackdrop = styled(ArkDialog.Backdrop, {
    base: {
        position: 'fixed',
        inset: 0,
        bg: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 40,
    }
})

export const DrawerPositioner = styled(ArkDialog.Positioner, {
    base: {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-start', // Slide from left
    }
})

export const DrawerContent = styled(ArkDialog.Content, {
    base: {
        bg: 'bg.surface',
        h: 'full',
        w: { base: 'full', sm: '400px' },
        shadow: 'lg',
        p: '6',
        display: 'flex',
        flexDirection: 'column',
    }
})

export const DrawerHeader = styled('div', {
    base: {
        mb: '4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})

export const DrawerBody = styled('div', {
    base: {
        flex: '1',
        overflowY: 'auto',
    }
})

export const DrawerCloseTrigger = styled(ArkDialog.CloseTrigger, {
    base: {
        cursor: 'pointer',
        bg: 'transparent',
        border: 'none',
        p: '2',
        color: 'text.muted',
        _hover: { color: 'text.main' }
    }
})
export const DrawerTitle = styled(ArkDialog.Title, {
    base: {
        fontWeight: 'bold',
        fontSize: 'xl',
        fontFamily: 'heading',
    }
})
