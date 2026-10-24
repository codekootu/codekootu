'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, Shield, Activity, ShieldAlert, Radar, Crosshair, Bug, 
  Code, Box, GitPullRequest, Key, FileSearch, Cloud, Server, Lock, 
  CloudLightning, Layers, BarChart, LineChart, PieChart, Database, 
  Users, KeyRound, Search, FileCheck, Share2, Target, Globe, 
  ServerOff, Clock, Link as LinkIcon, Radio, Laptop, Router, 
  Smartphone, Cpu, Network, Globe2, GitBranch, HardDrive, 
  ShieldOff, AlertTriangle, Terminal, CheckCircle2, Eye, Zap, XCircle, Play
} from 'lucide-react';

// --- RESOURCES GRID DATA ---
const resourceTools = [
  { name: "Wireshark", cat: "Network Analysis", icon: Activity },
  { name: "Burp Suite", cat: "Web Pentesting", icon: ShieldAlert },
  { name: "Nmap", cat: "Network Mapping", icon: Radar },
  { name: "Metasploit", cat: "Penetration Testing", icon: Crosshair },
  { name: "OWASP ZAP", cat: "Vuln Scanning", icon: Bug },
  { name: "SonarQube", cat: "Code Quality", icon: Code },
  { name: "Snyk", cat: "Dependency Security", icon: Box },
  { name: "Dependabot", cat: "Vuln Management", icon: GitPullRequest },
  { name: "GitGuardian", cat: "Secrets Detection", icon: Key },
  { name: "Checkmarx", cat: "SAST", icon: FileSearch },
  { name: "Cloudflare", cat: "WAF & DDoS", icon: Cloud },
  { name: "AWS Sec Hub", cat: "Cloud Posture", icon: Server },
  { name: "Vault", cat: "Secrets Mgmt", icon: Lock },
  { name: "Prisma Cloud", cat: "Cloud Security", icon: CloudLightning },
  { name: "Terraform", cat: "IaC Security", icon: Layers },
  { name: "Splunk", cat: "SIEM", icon: BarChart },
  { name: "Datadog", cat: "Observability", icon: LineChart },
  { name: "Grafana", cat: "Dashboards", icon: PieChart },
  { name: "Elastic", cat: "Log Analysis", icon: Database },
  { name: "CrowdStrike", cat: "EDR", icon: Shield },
  { name: "Okta", cat: "Identity Mgmt", icon: Users },
  { name: "1Password", cat: "Password Mgr", icon: KeyRound },
  { name: "VirusTotal", cat: "Threat Intel", icon: Search },
  { name: "Vanta", cat: "Compliance", icon: FileCheck },
  { name: "MISP", cat: "Threat Sharing", icon: Share2 },
];

const tabs = ['Overview', 'Threat Intel', 'Assets', 'Resources'];

export default function CyberCommandCenter() {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Auth State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Simulated fetching state for the "Threat Intel" terminal
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { 
        router.push('/team/login'); 
        return; 
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role === 'cyber' || profile?.role === 'super_admin') {
        setIsAuthorized(true);
      }
      setLoading(false);
    }
    checkAccess();
  }, [router, supabase]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-mono">Verifying Clearance...</div>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-8 font-sans">
        <ShieldOff size={64} className="text-red-500 mb-6" strokeWidth={1} />
        <h1 className="text-2xl font-bold mb-2 tracking-widest uppercase">Access Denied</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center text-sm">Clearance required.</p>
        <Link href="/team/dashboard" className="px-6 py-3 bg-white text-black rounded font-medium hover:bg-gray-200 transition-colors text-sm">Return to Workbench</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      
      {/* Header Container */}
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/team/dashboard" className="text-gray-400 hover:text-white transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Terminal className="text-red-500" size={24} /> Cyber Command Center
            </h1>
          </div>
          <p className="text-xs text-gray-500 ml-8">Active Build: TRIAL IDEA</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#111] rounded-lg p-1 border border-[#222]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm rounded-md font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'Overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Alerts</div>
                <div className="text-3xl font-light">3</div>
              </div>
              <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Open Vulns</div>
                <div className="text-3xl font-light">14</div>
              </div>
              <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Threat Level</div>
                <div className="text-3xl font-light text-yellow-500">Elevated</div>
              </div>
              <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Uptime (30D)</div>
                <div className="text-3xl font-light">99.99%</div>
              </div>
            </div>

            {/* Main Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-lg p-6 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium flex items-center gap-2"><Activity size={16} className="text-red-500"/> Live Incident Feed</h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1">Live <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span></span>
                </div>
                <div className="flex-1 bg-[#050505] border border-[#222] rounded flex items-center justify-center text-gray-600 text-sm font-mono">
                  [ Awaiting incoming packet data... ]
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 flex flex-col h-[400px]">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-4"><AlertTriangle size={16} className="text-red-500"/> Recent IOC Alerts</h3>
                <div className="space-y-3 overflow-y-auto pr-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-[#111] border border-[#222] rounded text-xs flex justify-between items-start">
                      <div>
                        <div className="text-red-400 font-mono mb-1">IP: 192.168.1.{100+i}</div>
                        <div className="text-gray-400">Suspicious SSH Brute Force</div>
                      </div>
                      <div className="text-gray-600">2m ago</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- THREAT INTEL TAB --- */}
        {activeTab === 'Threat Intel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-2 px-2">
                 <h3 className="text-sm font-medium text-gray-400 font-mono">intel_scanner.sh</h3>
                 <button onClick={() => setIsScanning(!isScanning)} className="text-xs flex items-center gap-1 text-green-400 hover:text-green-300">
                   <Play size={12}/> Run Scan
                 </button>
              </div>
              <div className="flex-1 bg-[#050505] border border-[#222] rounded p-4 font-mono text-sm overflow-y-auto text-green-500/80">
                <p>{'>'} Initializing threat intelligence module...</p>
                <p>{'>'} Connecting to global databases...</p>
                <p>{'>'} Fetching CVE definitions...</p>
                {isScanning ? <p className="animate-pulse">{'>'} Scanning network perimeter for vulnerabilities...</p> : null}
                <p className="text-gray-500 mt-4">[Terminal ready for input]</p>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 flex flex-col h-[600px]">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-6"><Crosshair size={16} className="text-red-500"/> Submit IOC</h3>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Indicator Type</label>
                  <select className="w-full bg-[#111] border border-[#222] rounded p-2 text-sm text-white focus:outline-none focus:border-red-500">
                    <option>IP Address</option>
                    <option>File Hash (SHA256)</option>
                    <option>Domain Name</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Indicator Value</label>
                  <input type="text" placeholder="e.g. 10.0.0.1" className="w-full bg-[#111] border border-[#222] rounded p-2 text-sm font-mono focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Context / Notes</label>
                  <textarea placeholder="Paste raw logs or context here..." className="w-full bg-[#111] border border-[#222] rounded p-2 text-sm h-32 resize-none focus:outline-none focus:border-red-500"></textarea>
                </div>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded transition-colors mt-4">
                Log Indicator
              </button>
            </div>
          </div>
        )}

        {/* --- ASSETS TAB --- */}
        {activeTab === 'Assets' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 h-[500px]">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-6"><Server size={16} className="text-red-500"/> Infrastructure Security Status</h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-[#222] pb-2">
                  <span className="text-gray-300">Production API (AWS)</span>
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> Secure</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#222] pb-2">
                  <span className="text-gray-300">Database Cluster (Supabase)</span>
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> Secure</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#222] pb-2">
                  <span className="text-gray-300">Edge Network (Cloudflare)</span>
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> Secure</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#222] pb-2">
                  <span className="text-gray-300">Employee Endpoints</span>
                  <span className="text-yellow-500 flex items-center gap-1"><AlertTriangle size={14}/> 2 Outdated</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 h-[500px]">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-6"><ShieldAlert size={16} className="text-red-500"/> Recent Asset Violations</h3>
              <div className="bg-[#111] border border-[#222] rounded p-4 font-mono text-xs text-red-400 overflow-x-auto space-y-2">
                <p>[CRITICAL] Unauthorized SSH attempt on node-04</p>
                <p className="text-gray-400 mt-2">at 14:32:01 UTC</p>
                <div className="h-px w-full bg-[#222] my-3"></div>
                <p>[WARNING] S3 Bucket 'kootu-backups' public access detected</p>
                <p className="text-gray-400 mt-2">at 11:15:22 UTC</p>
              </div>
            </div>
          </div>
        )}

        {/* --- RESOURCES TAB --- */}
        {activeTab === 'Resources' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2"><Layers size={18} className="text-red-500"/> Cyber Ecosystem</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {resourceTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-[#0f0f0f] border border-[#222] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#151515] hover:border-red-500/50 transition-colors cursor-pointer group"
                  >
                    <div className="text-red-500 mb-4 group-hover:scale-110 transition-transform">
                      <Icon size={26} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-200 mb-1">{tool.name}</h3>
                    <p className="text-xs text-gray-500">{tool.cat}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
