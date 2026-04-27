import { motion } from "framer-motion";

const steps = [
  { label: "Student Profile", x: 8, y: 50, color: "#42147d" },
  { label: "AI Analysis", x: 35, y: 20, color: "#6d28d9" },
  { label: "Risk Check", x: 35, y: 80, color: "#7c3aed" },
  { label: "Score", x: 62, y: 35, color: "#42147d" },
  { label: "Shortlist", x: 62, y: 65, color: "#5b21b6" },
  { label: "Expert Review", x: 88, y: 50, color: "#42147d" },
];

const edges = [
  [0, 1], [0, 2],
  [1, 3], [1, 4],
  [2, 3], [2, 4],
  [3, 5], [4, 5],
];

const stats = [
  { value: "< 3s", label: "Response time" },
  { value: "98%", label: "Acceptance rate" },
  { value: "24/7", label: "Available" },
  { value: "20+", label: "Countries served" },
];

export function AIMotionSection() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-br from-primary/4 via-white to-secondary/4 border-b border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: flow diagram */}
          <div className="relative h-64 md:h-72">
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(66,20,125,0.6)" />
                  <stop offset="100%" stopColor="rgba(109,40,217,0.3)" />
                </linearGradient>
              </defs>

              {edges.map(([a, b], i) => (
                <motion.line
                  key={i}
                  x1={steps[a].x}
                  y1={steps[a].y}
                  x2={steps[b].x}
                  y2={steps[b].y}
                  stroke="url(#flowGrad1)"
                  strokeWidth="0.6"
                  strokeDasharray="2 1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0.3, 0.8, 0.3] }}
                  transition={{
                    pathLength: { duration: 1.2, delay: i * 0.15 },
                    opacity: { duration: 2.5, repeat: Infinity, delay: i * 0.2 },
                  }}
                />
              ))}

              {steps.map((node, i) => (
                <g key={i}>
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={i === 0 || i === 5 ? 5.5 : 4}
                    fill={node.color}
                    opacity={0.9}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0.85, 1.1, 0.85] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <motion.text
                    x={node.x}
                    y={node.y + (i % 2 === 0 ? -7 : 8)}
                    textAnchor="middle"
                    fontSize="3.5"
                    fill="#374151"
                    fontWeight="600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {node.label}
                  </motion.text>
                </g>
              ))}
            </svg>

            {/* Glow overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(66,20,125,0.06) 0%, transparent 70%)",
            }} />
          </div>

          {/* Right: stats + description */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Intelligence that maps your path
            </h2>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              AskiMate doesn't just answer questions — it processes your profile through a structured decision graph, identifies risks, scores your chances, and surfaces the right opportunities for you.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-border/60 p-4 text-center shadow-sm"
                >
                  <p className="text-2xl font-bold text-primary mb-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
