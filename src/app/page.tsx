import Scene from "@/components/3d/Scene";
import SkyScenery from "@/components/ui/SkyScenery";
import HeroHeadline from "@/components/ui/HeroHeadline";
import Counter from "@/components/ui/Counter";

export default function Home() {
  return (
    <main className="relative w-full bg-black">
      {/* 1. Cinematic Dark Background */}
      <SkyScenery />
      
      {/* 2. Global 3D Drone Canvas (Scroll-Driven via Scene.tsx) */}
      <Scene />
      
      {/* 3. HTML Sections Overlay (Hero Only for now) */}
      <div className="relative z-10 w-full pointer-events-none">
        
        {/* HERO SECTION */}
        <section className="relative flex min-h-[100dvh] items-end overflow-hidden bg-transparent px-6 pb-[14vh] pt-28 md:pb-[16vh] md:pt-36">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-display text-[15vw] font-bold uppercase leading-none text-fg/[0.04] sm:text-[20vw] md:top-10"
          >
            PAWAAC
          </span>

          <div className="mx-auto w-full max-w-7xl text-left pointer-events-auto relative z-10">
            
            <HeroHeadline
              text="Autonomous Aerial Surveillance"
              className="max-w-5xl font-display text-[clamp(2.5rem,5vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-white [text-wrap:balance] [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]"
            />

            <p className="mt-6 max-w-xl font-body text-lg text-white/90 leading-relaxed [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
              Next-generation defense solutions powered by edge AI. Designed for critical infrastructure and tactical deployments where standard drones fail.
            </p>
            
            {/* The 3 Core Pillars */}
            <div className="mt-6 flex flex-wrap gap-3 pointer-events-none">
              <span className="rounded-full border border-white/20 bg-black/50 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                GPS-Denied Navigation
              </span>
              <span className="rounded-full border border-white/20 bg-black/50 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                Computer Vision AI
              </span>
              <span className="rounded-full border border-white/20 bg-black/50 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/70 backdrop-blur-md">
                Docking Station (R&D)
              </span>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center gap-6 pointer-events-auto">
              <a
                href="/product"
                className="inline-block bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform hover:scale-105"
              >
                See the platform
              </a>
              <button className="group flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-70">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  ▶
                </span>
                Watch System Action
              </button>
            </div>
            
          </div>
        </section>
        {/* PROBLEM SECTION */}
        <section id="section-problem" className="relative flex flex-col justify-center px-6 pt-24 pb-16 md:px-24">
          <div className="w-full max-w-7xl mx-auto pointer-events-auto relative z-10">
            
            <div className="mb-16 max-w-3xl">
              <h2 className="font-display text-5xl font-bold uppercase text-white md:text-6xl">
                The <span className="text-red-500">Problem</span>
              </h2>
              <p className="mt-4 font-body text-xl text-white/70 leading-relaxed">
                Current border and infrastructure surveillance relies on human-piloted drones. But human pilots have critical limits that create massive operational vulnerabilities.
              </p>
            </div>

            {/* Glossy Liquid Glass Cards */}
            <div className="flex flex-col gap-12">
              {/* Stat 1 */}
              <div className="max-w-md rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg shadow-2xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50">Hardware Limitation</h3>
                <p className="mt-2 font-display text-4xl font-bold text-white md:text-5xl">20 MINUTE<br/><span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">FLIGHT TIME</span></p>
                <p className="mt-4 font-body text-base text-white/70 leading-relaxed">Standard quadcopters require a human pilot on the ground to constantly land, swap batteries, and relaunch.</p>
              </div>

              {/* Stat 2 */}
              <div className="max-w-md self-end text-right rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg shadow-2xl">
                <div className="mb-4 ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"></line><path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M2 8.82a15 15 0 0 1 4.17-2.65"></path><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.82"></path></svg>
                </div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50">Communication Vulnerability</h3>
                <p className="mt-2 font-display text-4xl font-bold text-white md:text-5xl">5 KILOMETER<br/><span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">RADIO RANGE</span></p>
                <p className="mt-4 font-body text-base text-white/70 leading-relaxed">Pilots must maintain radio line-of-sight. If the drone flies behind a mountain, the mission fails entirely.</p>
              </div>

              {/* Stat 3 */}
              <div className="max-w-md self-center text-center rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg shadow-2xl">
                <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/></svg>
                </div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50">The Human Bottleneck</h3>
                <p className="mt-2 font-display text-4xl font-bold text-white md:text-5xl">OPERATOR<br/><span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">FATIGUE</span></p>
                <p className="mt-4 font-body text-base text-white/70 leading-relaxed">Critical threat detection accuracy drops by 80% after just 20 minutes of continuous screen monitoring.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: TRACTION / FIELD PROVEN (MOVED UP, CYAN ACCENT, 6-GRID) */}
        <section id="section-traction" className="relative flex flex-col justify-center px-6 py-24 md:px-24">
          <div className="w-full max-w-7xl mx-auto pointer-events-auto relative z-10">
            
            <div className="mb-12 text-center">
              <h2 className="font-display text-4xl font-bold uppercase text-white md:text-6xl">
                Field <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Proven</span>
              </h2>
              <p className="mt-4 mx-auto max-w-2xl font-body text-lg text-white/70">
                Operational across India's defense, police & critical-infrastructure sectors.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {/* Glossy Cyan Glass Cards */}
              <div className="rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent p-6 backdrop-blur-lg text-center shadow-2xl transition-transform hover:-translate-y-1">
                <Counter end={500} suffix="+" className="block font-display text-4xl font-bold text-white md:text-5xl" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200">Missions Flown</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent p-6 backdrop-blur-lg text-center shadow-2xl transition-transform hover:-translate-y-1">
                <Counter end={99.9} decimals={1} suffix="%" className="block font-display text-4xl font-bold text-white md:text-5xl" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200">Uptime</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent p-6 backdrop-blur-lg text-center shadow-2xl transition-transform hover:-translate-y-1">
                <Counter end={10} prefix="< " suffix="m" className="block font-display text-4xl font-bold text-white md:text-5xl" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200">Deployment Time</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent p-6 backdrop-blur-lg text-center shadow-2xl transition-transform hover:-translate-y-1">
                <Counter end={120} suffix="m" className="block font-display text-4xl font-bold text-white md:text-5xl" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200">Flight Endurance</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent p-6 backdrop-blur-lg text-center shadow-2xl transition-transform hover:-translate-y-1">
                <Counter end={520} suffix="+" className="block font-display text-4xl font-bold text-white md:text-5xl" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200">Operational Hours</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent p-6 backdrop-blur-lg text-center shadow-2xl transition-transform hover:-translate-y-1">
                <Counter end={650} suffix="+" className="block font-display text-4xl font-bold text-white md:text-5xl" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-200">Test Hours</p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-[10vh]" />

        {/* SECTION 5: THE BRIDGE (INTELLIGENCE) */}
        <section id="section-bridge" className="relative flex min-h-[100dvh] items-center justify-center px-6 md:px-24">
          <div className="w-full max-w-5xl text-center pointer-events-auto relative z-10">
            <h2 className="font-display text-5xl font-bold uppercase text-white md:text-7xl leading-tight drop-shadow-2xl">
              Hardware gets you in the air. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Intelligence keeps you there.</span>
            </h2>
            <p className="mt-8 mx-auto max-w-3xl font-body text-xl text-white/70 leading-relaxed">
              A drone is only as good as the brain flying it. To achieve true persistent surveillance without human pilots, we had to reinvent how unmanned systems see, navigate, and survive in the wild.
            </p>
          </div>
        </section>

        <div className="flex justify-center py-[15vh] pointer-events-auto relative z-10">
          <div className="rounded-full bg-white px-8 py-3 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
             <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-black">
               Our Core Technologies
             </p>
          </div>
        </div>

        {/* SECTION 6: GPS DENIED */}
        <section id="section-gps" className="relative flex min-h-[120dvh] items-center px-6 md:px-24">
          <div className="w-full max-w-7xl mx-auto pointer-events-auto relative z-10">
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="h-px w-8 bg-red-500"></div>
                 <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-red-500">Core Technology 01</p>
              </div>
              <h2 className="font-display text-5xl font-bold uppercase text-white md:text-6xl leading-tight">
                GPS-Denied <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Navigation</span>
              </h2>
              <p className="font-body text-lg text-white/70 leading-relaxed">
                When standard drones fall out of the sky due to signal jamming, our proprietary inertial and visual odometry systems take over instantly. Total mission continuity in hostile environments.
              </p>
              {/* Mobile-only fallback image since 3D Holograms are disabled on small screens */}
              <div className="md:hidden w-full aspect-video rounded-2xl overflow-hidden border border-red-500/30 mt-4 relative">
                 <img src="/images/planner.jpeg" alt="GPS HUD" className="w-full h-full object-cover mix-blend-screen" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                 <div className="absolute bottom-3 left-3 text-red-500 font-mono text-[10px] font-bold tracking-widest">ENCRYPTED LINK</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: VISION AI */}
        <section id="section-ai" className="relative flex min-h-[120dvh] items-center px-6 md:px-24">
          <div className="w-full max-w-7xl mx-auto pointer-events-auto relative z-10 flex justify-end">
            <div className="w-full lg:w-1/3 flex flex-col gap-6 text-right items-end">
              <div className="flex items-center gap-3">
                 <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-blue-400">Core Technology 02</p>
                 <div className="h-px w-8 bg-blue-400"></div>
              </div>
              <h2 className="font-display text-5xl font-bold uppercase text-white md:text-6xl leading-tight">
                Computer <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-cyan-400">Vision AI</span>
              </h2>
              <p className="font-body text-lg text-white/70 leading-relaxed text-right">
                Edge-processed threat detection. The drone autonomously identifies vehicles, personnel, and unauthorized assets in real-time, streaming locked-on intelligence directly to command.
              </p>
              {/* Mobile-only fallback image */}
              <div className="md:hidden w-full aspect-video rounded-2xl overflow-hidden border border-blue-400/30 mt-4 relative">
                 <img src="/images/vision-applied.jpeg" alt="Vision AI" className="w-full h-full object-cover mix-blend-screen" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                 <div className="absolute bottom-3 right-3 text-blue-400 font-mono text-[10px] font-bold tracking-widest">OBJ: LOCKED</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: DOCKING */}
        <section id="section-docking" className="relative flex min-h-[70dvh] items-center px-6 md:px-24">
          <div className="w-full max-w-7xl mx-auto pointer-events-auto relative z-10 flex justify-start">
            <div className="w-full lg:w-1/3 flex flex-col gap-6 text-left items-start">
              <div className="flex items-center gap-3">
                 <div className="h-px w-8 bg-zinc-400"></div>
                 <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Core Technology 03</p>
              </div>
              <h2 className="font-display text-5xl font-bold uppercase text-white md:text-6xl leading-tight">
                Autonomous <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-200">Docking</span>
              </h2>
              <p className="font-body text-lg text-white/70 leading-relaxed text-left">
                Persistent surveillance requires persistent power. Our automated docking stations (R&D) allow for rapid battery swapping and weather-proof storage at forward operating bases.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative bg-black border-t border-white/10 pt-12 pb-8 px-6 md:px-24 overflow-hidden pointer-events-auto z-10">
           {/* Background glow */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-[100px] bg-cyan-500/10 blur-3xl rounded-full"></div>

           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
              {/* Left Branding */}
              <div className="flex flex-col gap-6 md:w-1/3">
                 <h2 className="font-display text-4xl font-bold tracking-widest text-white uppercase">PAWAAC</h2>
                 <p className="font-mono text-xs text-white/50 leading-relaxed uppercase tracking-widest">
                   Next-Generation Autonomous Aerial Systems.<br/>Built for contested environments.
                 </p>
                 <div className="flex gap-4 mt-4">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path></svg>
                    </div>
                 </div>
              </div>
              
              {/* Links */}
              <div className="flex gap-16 md:w-2/3 justify-end">
                 <div className="flex flex-col gap-4">
                    <span className="font-mono text-[10px] text-white/30 font-bold uppercase tracking-widest">Technologies</span>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">GPS-Denied Nav</a>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">Vision AI</a>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">Swarm Logistics</a>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">Auto-Docking</a>
                 </div>
                 <div className="flex flex-col gap-4">
                    <span className="font-mono text-[10px] text-white/30 font-bold uppercase tracking-widest">Company</span>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">About Us</a>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">Careers</a>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">Investors</a>
                    <a href="#" className="font-body text-sm text-white/70 hover:text-cyan-400 transition-colors">Contact</a>
                 </div>
              </div>
           </div>

           {/* Bottom Bar */}
           <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                © 2026 PAWAAC Inc. All rights reserved.
              </span>
              <div className="flex gap-6">
                <a href="#" className="font-mono text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="font-mono text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors">Terms of Service</a>
              </div>
           </div>
        </footer>
      </div>
    </main>
  );
}
