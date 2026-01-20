import SystemMonitor from '@/features/dashboard/SystemMonitor'
import KnowledgeGraph from '@/features/memory/KnowledgeGraph'
import { useAuth } from '@/features/auth/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Target, Activity } from 'lucide-react'

export default function DashboardPage() {
    const { user } = useAuth()

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gradient tracking-tight">Command Center</h1>
                    <p className="text-muted-foreground mt-2">Welcome back, Agent <span className="text-primary font-mono">{user?.email?.split('@')[0]}</span></p>
                </div>
                <Badge variant="success" className="px-3 py-1 animate-pulse">
                    SYSTEM ONLINE
                </Badge>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* System Monitor - Spans full width on mobile, 2 cols on large */}
                <div className="md:col-span-2">
                    <SystemMonitor />
                </div>

                {/* Quick Stats Column */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Zap className="text-primary" /> 92%
                            </CardTitle>
                            <CardDescription>Energy Levels</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[92%] shadow-[0_0_10px_var(--primary)]" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Optimal performance range.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-secondary/5 border-secondary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Target className="text-secondary" /> 4.5h
                            </CardTitle>
                            <CardDescription>Deep Work</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Session active for 45 mins.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Knowledge Graph - Spans full width */}
                <div className="hidden md:block md:col-span-2 lg:col-span-3 h-[500px]">
                    <KnowledgeGraph />
                </div>

                {/* Mission Status */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity /> Active Missions</CardTitle>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                { title: 'Update Neural Interface', status: 'In Progress', variant: 'warning' },
                                { title: 'Calibrate Sensors', status: 'Pending', variant: 'secondary' },
                                { title: 'Sync Data Logs', status: 'Completed', variant: 'success' },
                            ].map((task, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all">
                                    <span className="font-medium text-sm">{task.title}</span>
                                    <Badge variant={task.variant as any}>{task.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
