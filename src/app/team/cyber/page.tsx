'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Shield, Activity, ShieldAlert, Radar, Crosshair, Bug, 
  Code, Box, GitPullRequest, Key, FileSearch, Cloud, Server, Lock, 
  CloudLightning, Layers, BarChart, LineChart, PieChart, Database, 
  Users, KeyRound, Search, FileCheck, Share2, Target, Globe, 
  ServerOff, Clock, Link as LinkIcon, Radio, Laptop, Router, 
  Smartphone, Cpu, CheckCircle, Network, Globe2, GitBranch 
} from 'lucide-react';

// --- DATA STRUCTURES FOR ALL TABS ---

const overviewTools = [
  { name: "Incident Response", cat: "Active Triage", icon: ShieldAlert },
  { name: "Vulnerability Mgmt", cat: "Patch Tracking", icon: Bug },
  { name: "Network Monitor", cat: "Traffic Analysis", icon: Activity },
  { name: "Compliance Audit", cat: "SOC2 / ISO", icon: FileCheck },
  { name: "Endpoint Protection", cat: "EDR Status", icon: Laptop },
  { name: "Identity Access", cat: "IAM Health", icon: KeyRound },
  { name: "Log Aggregation", cat: "SIEM Overview", icon: Database },
  { name: "Backup Status", cat: "Disaster Recovery", icon: HardDrive },
  { name: "Firewall Rules", cat: "WAF & Edge", icon: Network },
  { name: "Threat Hunting", cat: "Proactive Search", icon: Crosshair },
];

const threatIntelTools = [
  { name: "MITRE ATT&CK", cat: "TTP Framework", icon: Target },
  { name: "AlienVault OTX", cat: "Open Threat Exchange", icon: Globe },
  { name: "Shodan", cat: "Exposed Assets", icon: Search },
  { name: "CVE Details", cat: "Vuln Database", icon: Bug },
  { name: "AbuseIPDB", cat: "IP Reputation", icon: ServerOff },
  { name: "Recorded Future", cat: "Predictive Intel", icon: Clock },
  { name: "VirusTotal", cat: "Malware Analysis", icon: Shield },
  { name: "URLScan.io", cat: "Website Scanner", icon: LinkIcon },
  { name: "ThreatFox", cat: "IOC Sharing", icon: Crosshair },
  { name: "GreyNoise", cat: "Noise Filtering", icon: Radio },
  { name: "MISP", cat: "Threat Sharing", icon: Share2 },
  { name: "URLhaus", cat: "Malicious URLs", icon: Globe2 },
];

const assetTools = [
  { name: "EC2 Instances", cat: "AWS Compute", icon: Server },
  { name: "S3 Buckets", cat: "AWS Storage", icon: Cloud },
  { name: "PostgreSQL DB", cat: "Database Cluster", icon: Database },
  { name: "VPC Networks", cat: "Cloud Network", icon: Network },
  { name: "IAM Roles", cat: "Access Control", icon: Users },
  { name: "Domain Names", cat: "DNS Assets", icon: Globe2 },
  { name: "Employee Laptops", cat: "Endpoints", icon: Laptop },
  { name: "Production Servers", cat: "On-Prem", icon: HardDrive },
  { name: "Network Gear", cat: "Routers/Switches", icon: Router },
  { name: "Mobile Devices", cat: "BYOD", icon: Smartphone },
  { name: "IoT Devices", cat: "Edge Hardware", icon: Cpu },
  { name: "Repositories", cat: "GitHub / GitLab", icon: GitBranch },
];

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

  // Helper function to render the correct grid based on active tab
  const getActiveTools = () => {
    switch (activeTab) {
      case 'Overview': return overviewTools;
      case 'Threat Intel': return threatIntelTools;
      case 'Assets': return assetTools;
      case 'Resources': return resourceTools;
      default: return overviewTools;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        
        {/* Header Title */}
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

        {/* Navigation Tabs */}
        <div className="flex bg-[#111] rounded-lg p-1 border border-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-medium mb-6">
          {activeTab === 'Resources' ? 'Cyber Ecosystem & Tools' : `${activeTab} Dashboard`}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {getActiveTools().map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div 
                key={index} 
                className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#151515] transition-colors cursor-pointer group"
              >
                <div className="text-red-500 mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-gray-200 mb-1">{tool.name}</h3>
                <p className="text-xs text-gray-500">{tool.cat}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
