import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Network } from 'lucide-react'
import { useVectorSearch } from './useVectorSearch'

interface Node extends d3.SimulationNodeDatum {
    id: string
    content: string
    group: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
    value: number
}

export default function KnowledgeGraph() {
    const svgRef = useRef<SVGSVGElement>(null)
    const [logs, setLogs] = useState<any[]>([])
    const { search, isSearching, results } = useVectorSearch()
    const [query, setQuery] = useState('')

    // Initial Load: Get recent logs
    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase
                .from('learning_logs')
                .select('id, content, created_at')
                .order('created_at', { ascending: false })
                .limit(50)

            if (data) setLogs(data)
        }
        fetchLogs()
    }, [])

    // D3 Visualization
    useEffect(() => {
        if (!logs.length || !svgRef.current) return

        const width = 800
        const height = 600

        // Clear previous
        d3.select(svgRef.current).selectAll("*").remove()

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
                g.attr("transform", event.transform)
            }))

        const g = svg.append("g")

        // Prepare Nodes
        const nodes: Node[] = logs.map(l => ({
            id: l.id,
            content: l.content,
            group: 1
        }))

        // Mock links for now (later use similarity)
        const links: Link[] = []
        for (let i = 0; i < nodes.length - 1; i++) {
            if (Math.random() > 0.7) {
                links.push({ source: nodes[i].id, target: nodes[i + 1].id, value: 1 })
            }
        }

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))

        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value))

        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 5)
            .attr("fill", "#00f0ff")
            .call(d3.drag<SVGCircleElement, Node>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        // Tooltips (simple title)
        node.append("title")
            .text(d => d.content.substring(0, 50) + "...")

        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as any).x)
                .attr("y1", d => (d.source as any).y)
                .attr("x2", d => (d.target as any).x)
                .attr("y2", d => (d.target as any).y)

            node
                .attr("cx", d => d.x!)
                .attr("cy", d => d.y!)
        })

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
        }

        function dragged(event: any) {
            event.subject.fx = event.x
            event.subject.fy = event.y
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
        }

    }, [logs])

    const handleSearch = async () => {
        if (!query) return
        await search(query)
    }

    return (
        <Card className="h-full flex flex-col glass-panel overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-primary" />
                    <h3 className="font-mono font-bold">Neural Knowledge Graph</h3>
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20" title="AI processing offline (Sandbox Mode)">
                        OFFLINE
                    </span>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search mental nodes..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-64 bg-black/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled
                        title="Search requires active AI connection"
                    />
                    <Button size="icon" variant="ghost" onClick={handleSearch} disabled={true}>
                        <Search className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative bg-black/80">
                {/* Search Overlay */}
                {results.length > 0 && (
                    <div className="absolute top-4 right-4 w-64 bg-black/90 border border-primary/30 rounded-lg p-2 max-h-[400px] overflow-y-auto z-10">
                        <h4 className="text-xs font-mono text-muted-foreground mb-2">RELEVANT NODES</h4>
                        {results.map(r => (
                            <div key={r.id} className="p-2 mb-2 bg-white/5 rounded text-xs hover:bg-primary/20 cursor-pointer transition-colors">
                                <div className="font-bold text-primary mb-1">{(r.similarity * 100).toFixed(0)}% Match</div>
                                {r.content.substring(0, 100)}...
                            </div>
                        ))}
                    </div>
                )}

                <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            </div>
        </Card>
    )
}
