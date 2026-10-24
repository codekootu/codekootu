import Link from "next/link";
import { 
  ArrowLeft, Shield, Activity, ShieldAlert, Radar, Crosshair, Bug, 
  Code, Box, GitPullRequest, Key, FileSearch, Cloud, Server, Lock, 
  CloudLightning, Layers, BarChart, LineChart, PieChart, Database, 
  Users, KeyRound, Search, FileCheck, Share2 
} from 'lucide-react';

const cyberTools = [
  { name: "Wireshark", category: "Network Analysis", icon: Activity },
  { name: "Burp Suite", category: "Web Pentesting", icon: ShieldAlert },
  { name: "Nmap", category: "Network Mapping", icon: Radar },
  { name: "Metasploit", category: "Penetration Testing", icon: Crosshair },
  { name: "OWASP ZAP", category: "Vuln Scanning", icon: Bug },
  { name: "SonarQube", category: "Code Quality", icon: Code },
  { name: "Snyk", category: "Dependency Security", icon: Box },
  { name: "Dependabot", category: "Vuln Management", icon: GitPullRequest },
  { name: "GitGuardian", category: "Secrets Detection", icon: Key },
  { name: "Checkmarx", category: "SAST", icon: FileSearch },
  { name: "Cloudflare", category: "WAF & DDoS", icon: Cloud },
  { name: "AWS Sec Hub", category: "Cloud Posture", icon: Server },
  { name: "Vault", category: "Secrets Mgmt", icon: Lock },
  { name: "Prisma Cloud", category: "Cloud Security", icon: CloudLightning },
  { name: "Terraform", category: "IaC Security", icon: Layers },
  { name: "Splunk", category: "SIEM", icon: BarChart },
  { name: "Datadog", category: "Observability", icon: LineChart },
  { name: "Grafana", category: "Dashboards", icon: PieChart },
  { name: "Elastic", category: "Log Analysis", icon: Database },
  { name: "CrowdStrike", category: "EDR", icon: Shield },
  { name: "Okta", category: "Identity Mgmt", icon: Users },
  { name: "1Password", category: "Password Mgr", icon: KeyRound },
  { name: "VirusTotal", category: "Threat Intel", icon: Search },
  { name: "Vanta", category: "Compliance", icon: FileCheck },
  { name: "MISP", category: "Threat Sharing", icon: Share2 },
];

export default function CyberCommandCenter() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/team" className="text-gray-400 hover:text-white transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="text-red-500" size={24} /> Cyber Command Center
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-8">Defense, Offense, & Infrastructure</p>
        </div>
        <div className="flex bg-[#111] rounded-lg p-1 border border-gray-800">
          <button className="px-6 py-2 text-sm text-gray-400 hover:text-white rounded-md transition">Overview</button>
          <button className="px-6 py-2 text-sm text-gray-400 hover:text-white rounded-md transition">Threat Intel</button>
          <button className="px-6 py-2 text-sm text-gray-400 hover:text-white rounded-md transition">Assets</button>
          <button className="px-6 py-2 text-sm bg-red-600 text-white rounded-md font-medium">Resources</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-medium mb-6">Cyber Ecosystem & Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cyberTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div key={index} className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#151515] transition-colors cursor-pointer group">
                <div className="text-red-500 mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-gray-200 mb-1">{tool.name}</h3>
                <p className="text-xs text-gray-500">{tool.category}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
