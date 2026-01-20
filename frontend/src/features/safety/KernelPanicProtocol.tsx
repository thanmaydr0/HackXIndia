import { useBurnoutDetection } from './useBurnoutDetection'
import SafeModeScreen from './SafeModeScreen'
import { Toaster, toast } from 'sonner'
import { useEffect, useRef } from 'react'

export default function KernelPanicProtocol() {
    const { burnoutState, isSafeMode, exitSafeMode } = useBurnoutDetection()
    const lastLevel = useRef(burnoutState.level)

    // Handle Warnings using Toasts
    useEffect(() => {
        if (burnoutState.level !== lastLevel.current) {
            if (burnoutState.level === 'warning') {
                toast.warning("System Stability Dropping", {
                    description: "Cognitive load is accumulating. Consider a tactical pause.",
                    duration: 5000,
                })
            }
            if (burnoutState.level === 'critical') {
                toast.error("Critical System Stress", {
                    description: "Burnout imminent. Protocol recommends immediate cooldown.",
                    duration: 8000,
                    action: {
                        label: "Take Break",
                        onClick: () => { } // Maybe trigger breathing manually?
                    }
                })
            }
            lastLevel.current = burnoutState.level
        }
    }, [burnoutState.level])

    // Lockout UI
    if (isSafeMode) {
        return (
            <SafeModeScreen
                triggers={burnoutState.triggers}
                onUnlock={exitSafeMode}
            />
        )
    }

    return null
}
