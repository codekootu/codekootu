'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, HardDrive, Plus, CheckCircle, XCircle, Clock,
  Wrench, Box, Camera, FileText, AlertTriangle, LinkIcon,
  Play, Save, Activity, Settings, Cpu, Layers, ShieldAlert,
  CircuitBoard, Zap, BoxSelect, Hammer, PenTool, Layout, Minus, Search, RotateCcw, Trash2
} from 'lucide-react';

const HARDWARE_TOOLS = [
  { name: 'Part-DB', desc: 'Component Inventory', icon: Box, url: 'https://part-db.com/' },
  { name: 'OpenBOM', desc: 'Bill of Materials', icon: FileText, url: 'https://www.openbom.com/' },
  { name: 'KiCad', desc: 'Schematic Design', icon: CircuitBoard, url: 'https://www.kicad.org/' },
  { name: 'EasyEDA', desc: 'PCB Layout', icon: Layers, url: 'https://easyeda.com/' },
  { name: 'Octopart', desc: 'BOM Pricing', icon: LinkIcon, url: 'https://octopart.com/' },
  { name: 'SimScale', desc: 'Thermal/Stress Sim', icon: Activity, url: 'https://www.simscale.com/' },
  { name: 'Autodesk Fusion', desc: '3D CAD Modeling', icon: BoxSelect, url: 'https://www.autodesk.com/products/fusion-360/' },
  { name: 'Onshape', desc: 'Cloud CAD', icon: Layout, url: 'https://www.onshape.com/' },
  { name: 'DigiKey', desc: 'Component Sourcing', icon: Zap, url: 'https://www.digikey.com/' },
  { name: 'Mouser', desc: 'Component Sourcing', icon: Zap, url: 'https://www.mouser.com/' },
  { name: 'GrabCAD', desc: '3D Model Library', icon: Box, url: 'https://grabcad.com/' },
  { name: 'Tinkercad', desc: 'Rapid 3D Prototyping', icon: PenTool, url: 'https://www.tinkercad.com/' },
  { name: 'Arduino Cloud', desc: 'IoT Firmware', icon: Cpu, url: 'https://cloud.arduino.cc/' },
  { name: 'ESPHome', desc: 'ESP32 Firmware', icon: Cpu, url: 'https://esphome.io/' },
  { name: 'Multisim Live', desc: 'Circuit Simulation', icon: Activity, url: 'https://www.multisim.com/' },
  { name: 'Thingiverse', desc: '3D Print Files', icon: Hammer, url: 'https://www.thingiverse.com/' },
  { name: 'Cura Slicer', desc: '3D Printing Prep', icon: Layers, url: 'https://ultimaker.com/software/ultimaker-cura/' },
  { name: 'Wokwi', desc: 'Embedded Simulator', icon: Play, url: 'https://wokwi.com/' },
  { name: 'Hackaday', desc: 'Hardware Inspiration', icon: Wrench, url: 'https://hackaday.io/' },
  { name: 'GitHub', desc: 'Firmware Version Control', icon: HardDrive, url: 'https://github.com/' },
];

export default function HardwareCommandCenter() {
  const supabase = createClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'engineering' | 'resources'>('inventory');
  const [invTab, setInvTab] = useState<'stock' | 'logs' | 'requests'>('stock');

  const [project, setProject] = useState<any>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [qaList, setQaList] = useState<any[]>([]);
  const [fabLogs, setFabLogs] = useState<any[]>([]);

  const [inventory, setInventory] = useState<any[]>([]);
  const [originalInventory, setOriginalInventory] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [restockRequests, setRestockRequests] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  // Forms
  const [pin, setPin] = useState('');
  const [component, setComponent] = useState('');
  const [voltage, setVoltage] = useState('3.3V');
  const [notes, setNotes] = useState('');

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Sensor');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemLoc, setNewItemLoc] = useState('');
  const [newItemThreshold, setNewItemThreshold] = useState('0'); // Default to 0

  const [glowingCard, setGlowingCard] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/team/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'public';

      if (role !== 'hardware' && role !== 'super_admin') {
        router.push('/team/dashboard');
        return;
      }
      setUserRole(role);

      const { data: projData } = await supabase.from('projects').select('*').eq('assigned_wing', 'hardware').limit(1).maybeSingle();
      const activeProj = projData || (await supabase.from('projects').select('*').limit(1).maybeSingle()).data;

      if (activeProj) {
        setProject(activeProj);
        const { data: pinData } = await supabase.from('pin_mappings').select('*').eq('project_id', activeProj.id);
        if (pinData) setPins(pinData);
        const { data: qaData } = await supabase.from('qa_checklists').select('*').eq('project_id', activeProj.id);
        if (qaData) setQaList(qaData);
        const { data: fabData } = await supabase.from('fabrication_logs').select('*').eq('project_id', activeProj.id);
        if (fabData) setFabLogs(fabData);
      }

      const { data: invData } = await supabase.from('component_inventory').select('*').order('name');
      if (invData) {
        setInventory(invData);
        setOriginalInventory(JSON.parse(JSON.stringify(invData)));
      }

      const { data: logData } = await supabase.from('inventory_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (logData) setInventoryLogs(logData);

      const { data: reqData } = await supabase.from('restock_requests').select('*').order('created_at', { ascending: false });
      if (reqData) setRestockRequests(reqData);
    }
    checkAuthAndFetch();
  }, [supabase, router]);

  const hasUnsavedChanges = JSON.stringify(inventory) !== JSON.stringify(originalInventory);

  const handleAddPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const { error, data } = await supabase.from('pin_mappings').insert({
      project_id: project.id, pin_number: pin, component, voltage, notes
    }).select();
    if (!error && data) {
      setPins([...pins, data[0]]);
      setPin(''); setComponent(''); setNotes('');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const { data: { session } } = await supabase.auth.getSession();
    const qty = parseInt(newItemQty);
    const threshold = parseInt(newItemThreshold);

    const { error, data } = await supabase.from('component_inventory').insert({
      name: newItemName,
      category: newItemCategory,
      quantity_in_stock: qty,
      location: newItemLoc,
      low_stock_threshold: threshold
    }).select();

    if (!error && data) {
      const newInv = [...inventory, data[0]].sort((a, b) => a.name.localeCompare(b.name));
      setInventory(newInv);
      setOriginalInventory(JSON.parse(JSON.stringify(newInv)));

      const { data: logData } = await supabase.from('inventory_logs').insert({
        item_name: newItemName,
        action: 'Created',
        quantity: qty,
        user_id: session?.user.id
      }).select();

      if (logData) setInventoryLogs([logData[0], ...inventoryLogs]);

      setNewItemName(''); setNewItemQty('1'); setNewItemLoc(''); setNewItemThreshold('0');
    }
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('component_inventory').delete().eq('id', id);

    if (!error) {
      setInventory(prev => prev.filter(item => item.id !== id));
      setOriginalInventory(prev => prev.filter(item => item.id !== id));

      // Log deletion
      const { data: logData } = await supabase.from('inventory_logs').insert({
        item_name: name,
        action: 'Deleted',
        quantity: 0,
        user_id: session?.user.id
      }).select();
      if (logData) setInventoryLogs([logData[0], ...inventoryLogs]);
    }
  };

  const adjustQty = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity_in_stock: Math.max(0, item.quantity_in_stock + delta) };
      }
      return item;
    }));
  };

  const saveChanges = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    const changes = inventory.filter(item => {
      const original = originalInventory.find(o => o.id === item.id);
      return original && original.quantity_in_stock !== item.quantity_in_stock;
    });

    if (changes.length === 0) return;

    for (const item of changes) {
      const original = originalInventory.find(o => o.id === item.id);
      const delta = item.quantity_in_stock - (original?.quantity_in_stock || 0);

      await supabase.from('component_inventory').update({ quantity_in_stock: item.quantity_in_stock }).eq('id', item.id);

      await supabase.from('inventory_logs').insert({
        item_name: item.name,
        action: delta > 0 ? 'Added' : 'Removed',
        quantity: Math.abs(delta),
        user_id: session?.user.id
      });
    }

    const { data: logData } = await supabase.from('inventory_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (logData) setInventoryLogs(logData);

    setOriginalInventory(JSON.parse(JSON.stringify(inventory)));
  };

  const discardChanges = () => {
    setInventory(JSON.parse(JSON.stringify(originalInventory)));
  };

  const requestRestock = async (itemName: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from('restock_requests').insert({
      component: itemName,
      quantity: 10,
      requested_by: session?.user.id,
      status: 'Pending'
    });

    if (!error) {
      const { data: logData } = await supabase.from('inventory_logs').insert({
        item_name: itemName,
        action: 'Restock Requested',
        quantity: 10,
        user_id: session?.user.id
      }).select();

      if (logData) setInventoryLogs([logData[0], ...inventoryLogs]);

      // Refresh requests
      const { data: reqData } = await supabase.from('restock_requests').select('*').order('created_at', { ascending: false });
      if (reqData) setRestockRequests(reqData);

      alert(`Restock request sent for ${itemName}. Check the "Restock Requests" tab!`);
    }
  };

  const handleToolClick = (e: React.MouseEvent, toolName: string) => {
    if (userRole === 'hardware' || userRole === 'super_admin') return;
    e.preventDefault();
    setGlowingCard(toolName);
    setToast({ msg: `Access Denied: You must be in the Hardware wing to use ${toolName}.`, visible: true });
    setTimeout(() => { setGlowingCard(null); setToast(prev => ({ ...prev, visible: false })); }, 2500);
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col relative">
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center justify-between px-8 flex-shrink-0 bg-[#0a0e12]">
        <div className="flex items-center gap-6">
          <Link href="/team/dashboard" className="text-[#78837c] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-normal tracking-tight flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-[#e0231c]" /> Hardware Command Center
            </h1>
            <p className="text-xs text-[#78837c]">Active Build: {project?.name || 'Loading...'}</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-[#05070a] p-1 rounded-lg border border-[#dfe7e0]/10">
          {['overview', 'inventory', 'engineering', 'resources'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-[#e0231c] text-white' : 'text-[#78837c] hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-8 pb-32">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">Components</div><div className="text-3xl font-light text-white">{inventory.reduce((acc, item) => acc + item.quantity_in_stock, 0)}</div></div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">Pin Mappings</div><div className="text-3xl font-light text-white">{pins.length}</div></div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">QA Passed</div><div className="text-3xl font-light text-green-500">{qaList.filter(q => q.status === 'Pass').length}/{qaList.length}</div></div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">Low Stock Alerts</div><div className="text-3xl font-light text-[#e0231c]">{inventory.filter(i => i.quantity_in_stock <= (i.low_stock_threshold ?? 3)).length}</div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6">
                <h3 className="font-medium flex items-center gap-2 mb-4"><Camera className="w-4 h-4 text-[#e0231c]" /> Fabrication Logs</h3>
                <div className="space-y-3">
                  {fabLogs.map(l => (<div key={l.id} className="bg-[#05070a] p-3 rounded border border-[#dfe7e0]/5"><div className="text-sm text-white font-medium mb-1">{l.title}</div><div className="text-xs text-[#78837c]">{l.notes}</div></div>))}
                  {fabLogs.length === 0 && <p className="text-sm text-[#78837c]">No logs yet.</p>}
                </div>
              </div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6">
                <h3 className="font-medium flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-[#e0231c]" /> Restock Alerts</h3>
                <div className="space-y-2">
                  {inventory.filter(i => i.quantity_in_stock <= (i.low_stock_threshold ?? 3)).map(i => (
                    <div key={i.id} className="text-sm text-[#dfe7e0] p-3 bg-[#e0231c]/10 rounded border border-[#e0231c]/20 flex justify-between">
                      <span>{i.name}</span>
                      <span className="font-bold">{i.quantity_in_stock} left</span>
                    </div>
                  ))}
                  {inventory.filter(i => i.quantity_in_stock <= (i.low_stock_threshold ?? 3)).length === 0 && (
                    <p className="text-sm text-[#78837c]">All stock levels optimal.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY (Main Tab) */}
        {activeTab === 'inventory' && (
          <div className="max-w-7xl mx-auto flex flex-col gap-6">

            <div className="flex gap-4 border-b border-[#dfe7e0]/10 pb-4">
              <button onClick={() => setInvTab('stock')} className={`text-lg font-medium pb-2 border-b-2 transition-colors ${invTab === 'stock' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}>Current Stock</button>
              <button onClick={() => setInvTab('logs')} className={`text-lg font-medium pb-2 border-b-2 transition-colors ${invTab === 'logs' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}>Activity Log</button>
              <button onClick={() => setInvTab('requests')} className={`text-lg font-medium pb-2 border-b-2 transition-colors ${invTab === 'requests' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}>Restock Requests</button>
            </div>

            {invTab === 'stock' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 sticky top-8">
                    <h2 className="text-lg font-medium mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-[#e0231c]" /> Add Component</h2>
                    <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                      <div>
                        <label className="text-xs uppercase text-[#78837c] mb-1 block">Component Name</label>
                        <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g. ESP32" required className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]" />
                      </div>
                      <div>
                        <label className="text-xs uppercase text-[#78837c] mb-1 block">Category</label>
                        <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]">
                          <option>Microcontroller</option><option>Sensor</option><option>Passive</option><option>Power</option><option>Mechanical</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-xs uppercase text-[#78837c] mb-1 block">Qty</label>
                          <input type="number" min="1" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs uppercase text-[#78837c] mb-1 block">Alert at</label>
                          <input type="number" min="0" value={newItemThreshold} onChange={e => setNewItemThreshold(e.target.value)} className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs uppercase text-[#78837c] mb-1 block">Bin</label>
                          <input type="text" value={newItemLoc} onChange={e => setNewItemLoc(e.target.value)} placeholder="A2" className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]" />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-[#e0231c] hover:bg-[#c01d17] text-white rounded font-medium transition-colors mt-2">Add to Inventory</button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-[#dfe7e0]/10 flex justify-between items-center bg-[#05070a]">
                      <h2 className="text-lg font-medium flex items-center gap-2"><Box className="w-5 h-5 text-[#e0231c]" /> Part Inventory</h2>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78837c]" />
                        <input type="text" placeholder="Search parts..." className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded pl-9 pr-3 py-2 text-sm outline-none focus:border-[#e0231c]" />
                      </div>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0a0e12] border-b border-[#dfe7e0]/10 text-xs uppercase tracking-widest text-[#78837c]">
                          <th className="p-4 font-medium">Component</th>
                          <th className="p-4 font-medium">Category</th>
                          <th className="p-4 font-medium text-center">Stock</th>
                          <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {inventory.map(item => {
                          const isLowStock = item.quantity_in_stock <= (item.low_stock_threshold ?? 3);
                          return (
                            <tr key={item.id} className="border-b border-[#dfe7e0]/5 hover:bg-[#dfe7e0]/5 transition-colors">
                              <td className="p-4">
                                <div className="font-medium text-white">{item.name}</div>
                                <div className="text-xs text-[#78837c]">{item.location || 'No location'} • Alert at {item.low_stock_threshold ?? 3}</div>
                              </td>
                              <td className="p-4 text-[#aab4ad]">{item.category}</td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => adjustQty(item.id, -1)} className="p-1 bg-[#05070a] border border-[#dfe7e0]/10 rounded hover:border-[#e0231c]"><Minus className="w-3 h-3" /></button>
                                  <span className={`font-mono text-lg font-bold ${isLowStock ? 'text-[#e0231c]' : 'text-white'}`}>{item.quantity_in_stock}</span>
                                  <button onClick={() => adjustQty(item.id, 1)} className="p-1 bg-[#05070a] border border-[#dfe7e0]/10 rounded hover:border-[#e0231c]"><Plus className="w-3 h-3" /></button>
                                </div>
                              </td>
                              <td className="p-4 text-right flex items-center justify-end gap-2">
                                {isLowStock ? (
                                  <button onClick={() => requestRestock(item.name)} className="px-3 py-1 bg-[#e0231c]/10 text-[#e0231c] border border-[#e0231c]/30 rounded text-xs hover:bg-[#e0231c]/20 transition-colors">
                                    Restock
                                  </button>
                                ) : (
                                  <span className="text-xs text-[#78837c]">OK</span>
                                )}
                                <button onClick={() => deleteItem(item.id, item.name)} className="p-1.5 text-[#78837c] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete Item">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {invTab === 'logs' && (
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 max-w-4xl mx-auto w-full">
                <h2 className="text-lg font-medium mb-6 flex items-center gap-2"><RotateCcw className="w-5 h-5 text-[#e0231c]" /> Inventory Activity Log</h2>
                <div className="space-y-4">
                  {inventoryLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between border-b border-[#dfe7e0]/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${log.action === 'Added' || log.action === 'Created' ? 'bg-green-500' :
                          log.action === 'Removed' || log.action === 'Deleted' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                        <div>
                          <div className="text-sm text-white">
                            <span className="font-bold text-[#e0231c]">{log.action}</span> {log.quantity > 0 ? `${log.quantity}x` : ''} {log.item_name}
                          </div>
                          <div className="text-xs text-[#78837c]">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {inventoryLogs.length === 0 && <p className="text-[#78837c] text-sm italic">No inventory activity yet.</p>}
                </div>
              </div>
            )}

            {invTab === 'requests' && (
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 max-w-4xl mx-auto w-full">
                <h2 className="text-lg font-medium mb-6 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-[#e0231c]" /> Restock Requests</h2>
                <div className="space-y-3">
                  {restockRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-[#05070a] border border-[#dfe7e0]/5 rounded">
                      <div>
                        <div className="text-sm font-medium text-white">{req.component}</div>
                        <div className="text-xs text-[#78837c]">Quantity: {req.quantity} • Status: <span className={req.status === 'Pending' ? 'text-yellow-500' : 'text-green-500'}>{req.status}</span></div>
                      </div>
                      <span className="text-xs text-[#78837c]">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {restockRequests.length === 0 && <p className="text-[#78837c] text-sm italic">No restock requests pending.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ENGINEERING (Pins & QA) */}
        {activeTab === 'engineering' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium flex items-center gap-2"><Cpu className="w-5 h-5 text-[#e0231c]" /> Pin Mappings</h2>
              </div>
              <form onSubmit={handleAddPin} className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" value={pin} onChange={e => setPin(e.target.value)} placeholder="Pin (e.g. GPIO 21)" required className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]/50" />
                  <select value={voltage} onChange={e => setVoltage(e.target.value)} className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]/50">
                    <option>3.3V</option><option>5V</option><option>GND</option>
                  </select>
                </div>
                <input type="text" value={component} onChange={e => setComponent(e.target.value)} placeholder="Component (e.g. DHT22 Sensor)" required className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]/50 mb-4" />
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (e.g. Pull-up resistor needed)" className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none focus:border-[#e0231c]/50 mb-4" />
                <button type="submit" className="w-full py-3 bg-[#e0231c] hover:bg-[#c01d17] text-white rounded font-medium transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Mapping</button>
              </form>
              <div className="flex flex-col gap-2">
                {pins.map(p => (<div key={p.id} className="flex items-center justify-between bg-[#0a0e12] p-4 rounded border border-[#dfe7e0]/10"><div className="flex items-center gap-4"><span className="font-mono text-[#e0231c] bg-[#e0231c]/10 px-3 py-1 rounded text-xs w-20 text-center">{p.pin_number}</span><div><div className="font-medium text-sm text-white">{p.component}</div><div className="text-xs text-[#78837c]">{p.voltage} — {p.notes}</div></div></div></div>))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#e0231c]" /> QA Checklist</h2>
              </div>
              <div className="flex flex-col gap-3">
                {qaList.map(qa => (
                  <div key={qa.id} className="flex items-start justify-between p-4 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded">
                    <div className="flex items-start gap-4">
                      {qa.status === 'Pass' ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> : qa.status === 'Fail' ? <XCircle className="w-5 h-5 text-red-500 mt-0.5" /> : <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />}
                      <div><h4 className="font-medium text-white text-sm">{qa.test_name}</h4><p className="text-xs text-[#78837c] mt-1">{qa.notes || 'No description'}</p></div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${qa.status === 'Pass' ? 'text-green-500 border-green-500/30 bg-green-500/10' : qa.status === 'Fail' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'}`}>{qa.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {activeTab === 'resources' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Hardware Ecosystem & Tools</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {HARDWARE_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isGlowing = glowingCard === tool.name;
                return (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" onClick={(e) => handleToolClick(e, tool.name)}
                    className={`bg-[#0a0e12] border p-5 rounded-lg transition-all group flex flex-col items-center text-center relative overflow-hidden ${isGlowing ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-[#dfe7e0]/10 hover:border-[#e0231c]/50'}`}>
                    <Icon className={`w-8 h-8 mb-3 transition-transform ${isGlowing ? 'text-red-500 animate-bounce' : 'text-[#e0231c] group-hover:scale-110'}`} />
                    <h3 className={`text-sm font-medium ${isGlowing ? 'text-red-500' : 'text-white'}`}>{tool.name}</h3>
                    <p className="text-[10px] text-[#78837c] mt-1">{tool.desc}</p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0e12] border-t border-[#e0231c]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 flex justify-center animate-in slide-in-from-bottom-4">
          <div className="bg-[#05070a] border border-[#e0231c] rounded-lg p-2 px-4 flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#dfe7e0]">
              <AlertTriangle className="w-5 h-5 text-[#e0231c]" />
              <span className="text-sm font-medium">You have unsaved inventory changes.</span>
            </div>
            <div className="flex gap-2">
              <button onClick={discardChanges} className="px-4 py-2 text-sm text-[#78837c] hover:text-white transition-colors">Discard</button>
              <button onClick={saveChanges} className="px-6 py-2 bg-[#e0231c] hover:bg-[#c01d17] text-white text-sm font-medium rounded transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-300 z-50 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#e0231c] text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 font-medium"><ShieldAlert className="w-5 h-5" />{toast.msg}</div>
      </div>
    </div>
  );
}