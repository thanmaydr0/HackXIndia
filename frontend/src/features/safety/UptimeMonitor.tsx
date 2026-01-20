import { Clock, Battery } from 'lucide-react'
import { useBreakScheduler } from './useBreakScheduler'
import BreakNotification from './BreakNotification'

export default function UptimeMonitor() {
    const { elapsedTime, activeBreak, completeBreak, snoozeBreak, skipBreak, isIdle } = useBreakScheduler()

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return `${h}h ${m}m`
    }

    return (
        <>
            <div className={`fixed top-4 right-20 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${isIdle ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-green-500/10 border-green-500/30 text-green-500'}`}>
                {isIdle ? (
                    <>
                        <Clock className="w-3 h-3" />
                        <span>IDLE</span>
                    </>

                ) : (
                    <>
                        <Battery className="w-3 h-3" />
                        <span>UPTIME: {formatTime(elapsedTime)}</span>
                    </>
                )}
            </div>

            <BreakNotification
                activeBreak={activeBreak}
                onComplete={completeBreak}
                onSnooze={snoozeBreak}
                onSkip={skipBreak}
            />
        </>
    )
}
