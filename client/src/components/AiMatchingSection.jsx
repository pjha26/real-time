// AiMatchingSection.jsx
// Zero dependencies — pure React + CSS animations
// Usage: <AiMatchingSection query="AI startup strategy" />

import { useEffect, useRef, useState, useCallback } from "react";

const EXPERTS = [
    { initials: "PS", name: "Dr. Priya Sharma", role: "AI / Machine Learning", score: 92, color: "#6C9FFF", bg: "rgba(108,159,255,0.15)", label: "Excellent match", statusColor: "#4ADE80" },
    { initials: "RK", name: "Rahul Kapoor", role: "Product Strategy", score: 87, color: "#A78BFA", bg: "rgba(167,139,250,0.15)", label: "Strong match", statusColor: "#6C9FFF" },
    { initials: "SM", name: "Sneha Mehta", role: "Full-stack Engineering", score: 79, color: "#4ADE80", bg: "rgba(74,222,128,0.15)", label: "Good match", statusColor: "#8A94AC" },
    { initials: "AV", name: "Arjun Verma", role: "UX / Design Systems", score: 74, color: "#FBBF24", bg: "rgba(251,191,36,0.15)", label: "Fair match", statusColor: "#8A94AC" },
];

const LOG_LINES = [
    "→ Analysing query vector embeddings...",
    "→ Cross-referencing 512 expert profiles...",
    "→ Scoring semantic similarity...",
];

export default function AiMatchingSection({ query = "AI strategy" }) {
    const scannerRef = useRef(null);
    const rafRef = useRef(null);
    const timersRef = useRef([]);
    const [phase, setPhase] = useState("idle");   // idle | scanning | done
    const [scores, setScores] = useState({});
    const [logs, setLogs] = useState([]);
    const [scanY, setScanY] = useState(0);
    const [scanOpacity, setScanOpacity] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const clearAll = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    const startScan = useCallback(() => {
        clearAll();
        setPhase("scanning");
        setScores({});
        setLogs([]);
        setScanY(0);
        setScanOpacity(1);
        setShowResult(false);

        const DURATION = 2800;
        let start = null;
        const h = scannerRef.current?.offsetHeight ?? 320;

        function frame(ts) {
            if (!start) start = ts;
            const pct = Math.min((ts - start) / DURATION, 1);
            const fade = pct > 0.9 ? 1 - (pct - 0.9) / 0.1 : 1;
            setScanY(pct * (h - 2));
            setScanOpacity(fade);
            if (pct < 1) { rafRef.current = requestAnimationFrame(frame); }
            else { setScanOpacity(0); revealResults(); }
        }
        rafRef.current = requestAnimationFrame(frame);

        LOG_LINES.forEach((line, i) => {
            timersRef.current.push(
                setTimeout(() => setLogs(prev => [...prev, line]), 600 + i * 800)
            );
        });
    }, [clearAll]);

    const revealResults = useCallback(() => {
        EXPERTS.forEach((_, i) => {
            timersRef.current.push(
                setTimeout(() => {
                    setScores(prev => ({ ...prev, [i]: true }));
                }, i * 200)
            );
        });
        timersRef.current.push(
            setTimeout(() => { setPhase("done"); setShowResult(true); }, 900)
        );
    }, []);

    useEffect(() => { startScan(); return clearAll; }, []);

    const top = EXPERTS[0];

    return (
        <section style={styles.section}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.tag}>
                    <span style={styles.liveDot} />
                    AI Matching
                </div>
                <h2 style={styles.headline}>Intelligent Expert Matching</h2>
                <p style={styles.sub}>
                    Our AI scans 500+ verified experts to find your perfect match
                </p>
            </div>

            {/* Scanner */}
            <div style={styles.scanner} ref={scannerRef}>

                {/* Scan line + glow */}
                <div style={{ ...styles.scanLine, top: scanY, opacity: scanOpacity }} />
                <div style={{ ...styles.scanGlow, top: scanY + 2, opacity: scanOpacity }} />

                {/* Table header */}
                <div style={styles.tableHeader}>
                    <span>Expert</span>
                    <span>Match</span>
                    <span>Relevance</span>
                    <span>Status</span>
                </div>

                {/* Expert rows */}
                {EXPERTS.map((ex, i) => {
                    const revealed = !!scores[i];
                    return (
                        <div
                            key={i}
                            style={{
                                ...styles.row,
                                background: revealed ? "rgba(108,159,255,0.04)" : "transparent",
                                transition: "background 0.4s",
                            }}
                        >
                            <div style={styles.nameCell}>
                                <div style={{ ...styles.avatar, background: ex.bg, color: ex.color }}>
                                    {ex.initials}
                                </div>
                                <div>
                                    <div style={styles.name}>{ex.name}</div>
                                    <div style={styles.role}>{ex.role}</div>
                                </div>
                            </div>

                            <div>
                                {revealed ? (
                                    <span style={{ ...styles.badge, background: ex.bg, color: ex.color }}>
                                        {ex.score}%
                                    </span>
                                ) : (
                                    <span style={styles.dash}>—</span>
                                )}
                            </div>

                            <div style={{ paddingRight: 16 }}>
                                <div style={styles.barTrack}>
                                    <div
                                        style={{
                                            ...styles.barFill,
                                            background: ex.color,
                                            width: revealed ? `${ex.score}%` : "0%",
                                            transition: revealed ? "width 0.9s ease" : "none",
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={styles.statusCell}>
                                <span
                                    style={{
                                        ...styles.statusDot,
                                        background: revealed ? ex.statusColor : "#2D3748",
                                    }}
                                />
                                <span style={{ color: revealed ? ex.statusColor : "#4A5568", fontSize: 12 }}>
                                    {revealed ? ex.label : "Scanning"}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Log lines */}
                <div style={styles.logBox}>
                    {logs.map((line, i) => (
                        <div key={i} style={styles.logLine}>{line}</div>
                    ))}
                </div>
            </div>

            {/* Best match result card */}
            {showResult && (
                <div style={styles.resultCard}>
                    <div style={{ ...styles.resultAvatar, background: top.bg, color: top.color }}>
                        {top.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={styles.resultName}>{top.name}</div>
                        <div style={styles.resultRole}>{top.role} · 142 sessions · ★ 4.9</div>
                    </div>
                    <div style={styles.resultPct}>{top.score}%</div>
                    <button style={styles.bookBtn} onClick={() => alert("Opening booking flow…")}>
                        Book Now
                    </button>
                </div>
            )}

            {/* Re-run button */}
            <button style={styles.rescanBtn} onClick={startScan}>
                ↺ Run matching again
            </button>
        </section>
    );
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
    section: {
        background: "#0A0F1E",
        borderRadius: 20,
        padding: "48px 40px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#E8ECF4",
    },
    header: { textAlign: "center", marginBottom: 32 },
    tag: {
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(108,159,255,0.1)",
        border: "1px solid rgba(108,159,255,0.25)",
        borderRadius: 20, padding: "4px 14px",
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: "#6C9FFF", textTransform: "uppercase", marginBottom: 14,
    },
    liveDot: {
        width: 6, height: 6, borderRadius: "50%",
        background: "#4ADE80",
        animation: "pulse 1.4s ease-in-out infinite",
        display: "inline-block",
    },
    headline: { fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8, color: "#E8ECF4" },
    sub: { fontSize: 15, color: "#8A94AC" },
    scanner: {
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(108,159,255,0.18)",
        background: "#0D1221",
        marginBottom: 16,
    },
    scanLine: {
        position: "absolute", left: 0, right: 0, height: 2,
        background: "#6C9FFF",
        boxShadow: "0 0 12px 2px rgba(108,159,255,0.7)",
        zIndex: 10, pointerEvents: "none",
        transition: "opacity 0.1s",
    },
    scanGlow: {
        position: "absolute", left: 0, right: 0, height: 80,
        background: "linear-gradient(to bottom, rgba(108,159,255,0.1), transparent)",
        zIndex: 9, pointerEvents: "none",
    },
    tableHeader: {
        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
        padding: "10px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontSize: 11, fontWeight: 700, letterSpacing: 1,
        color: "#4A5568", textTransform: "uppercase",
    },
    row: {
        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
        alignItems: "center", padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
    },
    nameCell: { display: "flex", alignItems: "center", gap: 10 },
    avatar: {
        width: 30, height: 30, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, flexShrink: 0,
    },
    name: { fontWeight: 600, color: "#E8ECF4", fontSize: 13 },
    role: { fontSize: 11, color: "#4A5568", marginTop: 1 },
    badge: {
        display: "inline-block", padding: "3px 8px",
        borderRadius: 20, fontSize: 11, fontWeight: 700,
    },
    dash: { color: "#2D3748", fontSize: 14 },
    barTrack: { height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 4 },
    statusCell: { display: "flex", alignItems: "center", gap: 5 },
    statusDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0, transition: "background 0.4s" },
    logBox: {
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "10px 16px",
        display: "flex", flexDirection: "column", gap: 3,
        minHeight: 58,
    },
    logLine: {
        fontFamily: "'Courier New', monospace", fontSize: 11, color: "#6C9FFF",
        animation: "fadeInUp 0.4s ease both",
    },
    resultCard: {
        borderRadius: 12,
        border: "1px solid rgba(74,222,128,0.3)",
        background: "rgba(74,222,128,0.05)",
        padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 14,
        animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
    },
    resultAvatar: {
        width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 700,
        border: "2px solid rgba(74,222,128,0.4)",
    },
    resultName: { fontSize: 15, fontWeight: 700, color: "#E8ECF4" },
    resultRole: { fontSize: 12, color: "#8A94AC", marginTop: 2 },
    resultPct: { fontSize: 26, fontWeight: 700, color: "#4ADE80", marginLeft: "auto", marginRight: 12 },
    bookBtn: {
        padding: "10px 18px", borderRadius: 8, border: "none",
        background: "linear-gradient(135deg, #6C9FFF, #A78BFA)",
        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
        flexShrink: 0,
    },
    rescanBtn: {
        width: "100%", padding: 12, borderRadius: 10,
        border: "1px solid rgba(108,159,255,0.25)",
        background: "rgba(108,159,255,0.07)",
        color: "#6C9FFF", fontSize: 13, fontWeight: 700, cursor: "pointer",
    },
};