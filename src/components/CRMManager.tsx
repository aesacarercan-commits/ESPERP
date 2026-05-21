import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, UserMinus, Phone, Mail, Calendar, Trash2, Edit2, 
  X, Check, Briefcase, TrendingUp, Handshake, AlertCircle, MessageSquare, 
  ChevronRight, CircleDollarSign, CheckSquare, Clock, ArrowUpRight, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { Employee, ERPConfig, CRMContact, CRMOpportunity, CRMInteraction } from '../types';

interface CRMManagerProps {
  contacts: CRMContact[];
  opportunities: CRMOpportunity[];
  interactions: CRMInteraction[];
  employees: Employee[];
  config: ERPConfig;
  onAddContact: (contact: Omit<CRMContact, 'id' | 'createdAt'>) => void;
  onUpdateContact: (contact: CRMContact) => void;
  onDeleteContact: (id: string) => void;
  onAddOpportunity: (opp: Omit<CRMOpportunity, 'id'>) => void;
  onUpdateOpportunityStage: (id: string, stage: CRMOpportunity['stage']) => void;
  onDeleteOpportunity: (id: string) => void;
  onAddInteraction: (interaction: Omit<CRMInteraction, 'id'>) => void;
  onUpdateSupportStatus: (id: string, status: CRMInteraction['supportStatus']) => void;
  onDeleteInteraction: (id: string) => void;
}

export default function CRMManager({
  contacts,
  opportunities,
  interactions,
  employees,
  config,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onAddOpportunity,
  onUpdateOpportunityStage,
  onDeleteOpportunity,
  onAddInteraction,
  onUpdateSupportStatus,
  onDeleteInteraction
}: CRMManagerProps) {
  const currentLang = config.language || 'en';
  const currencySymbol = config.currency === 'USD' ? '$' : config.currency === 'EUR' ? '€' : config.currency === 'TRY' ? '₺' : '£';

  // State Management
  const [activeSubTab, setActiveSubTab] = useState<'contacts' | 'pipeline' | 'tickets'>('contacts');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Search and Filter states
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState<string>('All');
  
  const [pipelineStageFilter, setPipelineStageFilter] = useState<string>('All');
  
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('All');

  // Form Modals / Toggles
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isAddingOpportunity, setIsAddingOpportunity] = useState(false);
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);

  // Editing contact state
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);

  // New Contact Form State
  const [newContact, setNewContact] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    role: '',
    status: 'Lead' as CRMContact['status'],
    notes: ''
  });

  // New Opportunity Form State
  const [newOpp, setNewOpp] = useState({
    title: '',
    contactId: '',
    stage: 'Lead' as CRMOpportunity['stage'],
    value: 0,
    estCloseDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    notes: ''
  });

  // New Interaction / Ticket Form State
  const [newInteraction, setNewInteraction] = useState({
    contactId: '',
    type: 'Call' as CRMInteraction['type'],
    title: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    supportStatus: 'Open' as CRMInteraction['supportStatus']
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalLeads = contacts.filter(c => c.status === 'Lead').length;
    const activePipeline = opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost');
    const pipelineValue = activePipeline.reduce((acc, o) => acc + o.value, 0);
    const wonValue = opportunities.filter(o => o.stage === 'Won').reduce((acc, o) => acc + o.value, 0);
    const openTickets = interactions.filter(i => i.type === 'Support_Ticket' && i.supportStatus !== 'Resolved').length;

    return { totalLeads, pipelineValue, wonValue, openTickets };
  }, [contacts, opportunities, interactions]);

  // Form Handlers
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.companyName.trim()) return;

    if (editingContact) {
      onUpdateContact({
        ...editingContact,
        name: newContact.name,
        companyName: newContact.companyName,
        email: newContact.email,
        phone: newContact.phone,
        role: newContact.role,
        status: newContact.status,
        notes: newContact.notes
      });
      setEditingContact(null);
    } else {
      onAddContact(newContact);
    }

    setIsAddingContact(false);
    setNewContact({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      role: '',
      status: 'Lead',
      notes: ''
    });
  };

  const startEditContact = (c: CRMContact) => {
    setEditingContact(c);
    setNewContact({
      name: c.name,
      companyName: c.companyName,
      email: c.email,
      phone: c.phone,
      role: c.role,
      status: c.status,
      notes: c.notes || ''
    });
    setIsAddingContact(true);
  };

  const handleOpportunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpp.title.trim() || !newOpp.contactId) return;
    onAddOpportunity({
      ...newOpp,
      value: Number(newOpp.value) || 0
    });
    setIsAddingOpportunity(false);
    setNewOpp({
      title: '',
      contactId: '',
      stage: 'Lead',
      value: 0,
      estCloseDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
      notes: ''
    });
  };

  const handleInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.title.trim() || !newInteraction.contactId) return;
    
    onAddInteraction({
      contactId: newInteraction.contactId,
      type: newInteraction.type,
      title: newInteraction.title,
      notes: newInteraction.notes,
      date: newInteraction.date,
      supportStatus: newInteraction.type === 'Support_Ticket' ? newInteraction.supportStatus || 'Open' : undefined
    });

    setIsAddingInteraction(false);
    setNewInteraction({
      contactId: '',
      type: 'Call',
      title: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      supportStatus: 'Open'
    });
  };

  // Filters definitions
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                            c.companyName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                            (c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase()));
      const matchesStatus = contactStatusFilter === 'All' || c.status === contactStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, contactSearch, contactStatusFilter]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => {
      return pipelineStageFilter === 'All' || o.stage === pipelineStageFilter;
    });
  }, [opportunities, pipelineStageFilter]);

  const filteredInteractions = useMemo(() => {
    return interactions.filter(i => {
      if (activeSubTab === 'tickets') {
        const isTicket = i.type === 'Support_Ticket';
        const matchesStatus = ticketStatusFilter === 'All' || i.supportStatus === ticketStatusFilter;
        return isTicket && matchesStatus;
      }
      return true;
    });
  }, [interactions, activeSubTab, ticketStatusFilter]);

  // Selected contact details computations
  const selectedContact = useMemo(() => {
    if (!selectedContactId) return null;
    return contacts.find(c => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

  const selectedContactHistory = useMemo(() => {
    if (!selectedContactId) return [];
    return interactions
      .filter(i => i.contactId === selectedContactId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interactions, selectedContactId]);

  const selectedContactDeals = useMemo(() => {
    if (!selectedContactId) return [];
    return opportunities.filter(o => o.contactId === selectedContactId);
  }, [opportunities, selectedContactId]);

  // Static pipeline mapping
  const PIPELINE_STAGES: { stage: CRMOpportunity['stage'], labelEn: string, labelTr: string, color: string }[] = [
    { stage: 'Lead', labelEn: 'Raw Lead', labelTr: 'Yeni Aday', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { stage: 'Contacted', labelEn: 'Contacted', labelTr: 'İletişim Kuruldu', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-450 dark:text-blue-400' },
    { stage: 'Proposal_Sent', labelEn: 'Proposal Sent', labelTr: 'Teklif Verildi', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' },
    { stage: 'Negotiation', labelEn: 'Under Negotiation', labelTr: 'Müzakere', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
    { stage: 'Won', labelEn: 'Closed Won', labelTr: 'Kazanıldı', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/10' },
    { stage: 'Lost', labelEn: 'Closed Lost', labelTr: 'Kaybedildi', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' },
  ];

  return (
    <div className="space-y-6 pt-2 text-left" id="crm-tab-panel">
      {/* Dynamic Action Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-xs transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-350">
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
            {currentLang === 'tr' ? 'ADAY MÜŞTERİ HOCMÜ' : 'TOTAL B2B LEADS'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{metrics.totalLeads}</span>
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded leading-none">
              {currentLang === 'tr' ? 'Aktif Havuz' : 'Active'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {currentLang === 'tr' ? 'Nitelikli sıcak aday sayısı' : 'Qualified prospects in early routing'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-xs transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-350">
            <CircleDollarSign className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
            {currentLang === 'tr' ? 'AKTİF BORU HATTI DEĞERİ' : 'ACTIVE PIPELINE VOLUME'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {currencySymbol}{metrics.pipelineValue.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-yellow-500 font-medium mt-2">
            {opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length} {currentLang === 'tr' ? 'açık fırsatta devam ediyor' : 'opportunities currently negotiated'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-xs transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-350">
            <Handshake className="w-12 h-12 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
            {currentLang === 'tr' ? 'KAZANILAN DEALS HASILAT' : 'COMPLETED WON DEALS'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {currencySymbol}{metrics.wonValue.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-500 font-extrabold">100% {currentLang === 'tr' ? 'Tahsilat' : 'Verified'}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {currentLang === 'tr' ? 'Toplam kapatılan ciro' : 'Accumulated revenue from won agreements'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-xs transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-350">
            <AlertCircle className="w-12 h-12 text-rose-500" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
            {currentLang === 'tr' ? 'AÇIK DESTEK TALEBİ' : 'ACTIVE SUPPORT TICKETS'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-450">{metrics.openTickets}</span>
            <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded leading-none">
              SLA Emergency
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {currentLang === 'tr' ? 'Yanıt bekleyen teknik biletler' : 'Active issues expecting operational resolution'}
          </p>
        </div>

      </div>

      {/* Controller Buttons / Sub tabs navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-250 dark:border-slate-800 pb-2">
        
        {/* Sub Navigation pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-205 dark:border-slate-800">
          <button
            onClick={() => { setActiveSubTab('contacts'); setSelectedContactId(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'contacts' 
                ? 'bg-white dark:bg-slate-800 shadow-xs text-sky-600 dark:text-sky-400' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {currentLang === 'tr' ? 'İletişim & Firmalar' : 'B2B Contacts'}
          </button>
          <button
            onClick={() => { setActiveSubTab('pipeline'); setSelectedContactId(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'pipeline' 
                ? 'bg-white dark:bg-slate-800 shadow-xs text-sky-600 dark:text-sky-400' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {currentLang === 'tr' ? 'Satış Hunusu' : 'Sales Pipeline'}
          </button>
          <button
            onClick={() => { setActiveSubTab('tickets'); setSelectedContactId(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'tickets' 
                ? 'bg-white dark:bg-slate-800 shadow-xs text-rose-600 dark:text-rose-400' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {currentLang === 'tr' ? 'Destek Talepleri' : 'Support Tickets'}
          </button>
        </div>

        {/* Global Action items */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {activeSubTab === 'contacts' && (
            <button
              onClick={() => { setEditingContact(null); setIsAddingContact(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-[10px] uppercase tracking-wider font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{currentLang === 'tr' ? 'İrtibat Ekle' : 'Add Contact'}</span>
            </button>
          )}

          {activeSubTab === 'pipeline' && (
            <button
              onClick={() => setIsAddingOpportunity(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-[10px] uppercase tracking-wider font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{currentLang === 'tr' ? 'Fırsat Oluştur' : 'New Opportunity'}</span>
            </button>
          )}

          {(activeSubTab === 'tickets' || selectedContactId) && (
            <button
              onClick={() => setIsAddingInteraction(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] uppercase tracking-wider font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{currentLang === 'tr' ? 'Etkileşim / Bilet Kaydet' : 'Log Interaction'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Main content grid splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left main data panels */}
        <div className={`${selectedContactId ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          
          {/* Subtab 1: Contacts Management panel */}
          {activeSubTab === 'contacts' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl shadow-xs space-y-4">
              
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={currentLang === 'tr' ? 'İletişim adı veya firma ada göre ara...' : 'Search by contact name, organization...'}
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-sky-500 dark:focus:border-sky-500 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{currentLang === 'tr' ? 'Statü:' : 'Status:'}</span>
                  <select
                    value={contactStatusFilter}
                    onChange={(e) => setContactStatusFilter(e.target.value)}
                    className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-xs font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-300 transition-all"
                  >
                    <option value="All">{currentLang === 'tr' ? 'Tümü' : 'All Contacts'}</option>
                    <option value="Lead">{currentLang === 'tr' ? 'Aday Müşteri' : 'Lead'}</option>
                    <option value="Customer">{currentLang === 'tr' ? 'Müşteri' : 'Active Customer'}</option>
                    <option value="Support_Required">{currentLang === 'tr' ? 'Destek Bekliyor' : 'Needs Support'}</option>
                    <option value="Inactive">{currentLang === 'tr' ? 'Pasif' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase text-left">
                      <th className="pb-2.5 pin-w-[150px]">{currentLang === 'tr' ? 'İsim & Rol' : 'Contact Profile'}</th>
                      <th className="pb-2.5">{currentLang === 'tr' ? 'B2B Organizasyon' : 'Enterprise / Company'}</th>
                      <th className="pb-2.5">{currentLang === 'tr' ? 'İletişim Detayları' : 'Communication'}</th>
                      <th className="pb-2.5">{currentLang === 'tr' ? 'Durum' : 'Status'}</th>
                      <th className="pb-2.5 text-right">{currentLang === 'tr' ? 'İşlem' : 'Management'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-500 dark:text-slate-500">
                          {currentLang === 'tr' ? 'Eşleşen irtibat kaydı bulunamadı.' : 'No customer interaction contacts matched the search filters.'}
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((contact) => (
                        <tr 
                          key={contact.id}
                          className={`border-b border-slate-100 dark:border-slate-800/40 text-xs hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer group ${
                            selectedContactId === contact.id ? 'bg-sky-50/40 dark:bg-sky-500/[0.04]' : ''
                          }`}
                          onClick={() => setSelectedContactId(contact.id)}
                        >
                          <td className="py-3">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                {contact.name}
                              </p>
                              <p className="text-[10px] text-slate-450 text-slate-500 dark:text-slate-400 mt-0.5">
                                {contact.role || (currentLang === 'tr' ? 'Unvan Belirtilmedi' : 'No Title')}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                            {contact.companyName}
                          </td>
                          <td className="py-3 font-mono space-y-0.5 text-[11px]">
                            {contact.email && (
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1.5 text-slate-550 text-slate-500 dark:text-slate-400">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              contact.status === 'Customer' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' 
                                : contact.status === 'Lead'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : contact.status === 'Support_Required'
                                ? 'bg-rose-500/10 text-rose-650 dark:text-rose-400'
                                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                            }`}>
                              {contact.status === 'Customer' && (currentLang === 'tr' ? 'Müşteri' : 'Customer')}
                              {contact.status === 'Lead' && (currentLang === 'tr' ? 'Aday Müşteri' : 'Lead')}
                              {contact.status === 'Support_Required' && (currentLang === 'tr' ? 'Destek Bekliyor' : 'Needs SLA')}
                              {contact.status === 'Inactive' && (currentLang === 'tr' ? 'Pasif' : 'Inactive')}
                            </span>
                          </td>
                          <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEditContact(contact)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer"
                                title={currentLang === 'tr' ? 'Düzenle' : 'Edit Profile'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(currentLang === 'tr' ? 'Bu müşteriyi silmek istediğinize emin misiniz? Tüm ilişkili kayıtlar korunacaktır.' : 'Are you sure you want to delete this contact?')) {
                                    onDeleteContact(contact.id);
                                    if (selectedContactId === contact.id) setSelectedContactId(null);
                                  }
                                }}
                                className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title={currentLang === 'tr' ? 'Sil' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-1" />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Subtab 2: Sales Pipeline Kanban Board */}
          {activeSubTab === 'pipeline' && (
            <div className="space-y-4">
              
              {/* Header Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black uppercase text-slate-850 dark:text-slate-200 tracking-wider">
                    {currentLang === 'tr' ? 'HEDEFLENEN YENİ SATIŞ PROJELERİ' : 'B2B ACCOUNT PIPELINES'}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550">
                    {currentLang === 'tr' ? 'Şirketlerin aşamalara göre finansal ağırlıkları' : 'Estimated volume metrics mapped by negotiation progress'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{currentLang === 'tr' ? 'Filtrele:' : 'Stage:'}</span>
                  <select
                    value={pipelineStageFilter}
                    onChange={(e) => setPipelineStageFilter(e.target.value)}
                    className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-xs font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-350"
                  >
                    <option value="All">{currentLang === 'tr' ? 'Tüm Aşamalar' : 'All Stages'}</option>
                    <option value="Lead">{currentLang === 'tr' ? 'Aday' : 'Lead'}</option>
                    <option value="Contacted">{currentLang === 'tr' ? 'İletişim' : 'Contacted'}</option>
                    <option value="Proposal_Sent">{currentLang === 'tr' ? 'Teklif' : 'Proposal Sent'}</option>
                    <option value="Negotiation">{currentLang === 'tr' ? 'Müzakere' : 'Negotiation'}</option>
                    <option value="Won">{currentLang === 'tr' ? 'Kazanıldı' : 'Closed Won'}</option>
                    <option value="Lost">{currentLang === 'tr' ? 'Kaybedildi' : 'Closed Lost'}</option>
                  </select>
                </div>
              </div>

              {/* Kanban layout columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {PIPELINE_STAGES.map((col) => {
                  const stageDeals = opportunities.filter(o => o.stage === col.stage);
                  const stageTotalVal = stageDeals.reduce((acc, d) => acc + d.value, 0);

                  if (pipelineStageFilter !== 'All' && pipelineStageFilter !== col.stage) return null;

                  return (
                    <div 
                      key={col.stage}
                      className="bg-slate-100/65 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80 min-h-[380px] flex flex-col space-y-3"
                    >
                      {/* Column Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-[5px] text-[8px] font-black uppercase tracking-wider ${col.color}`}>
                            {currentLang === 'tr' ? col.labelTr : col.labelEn}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
                            ({stageDeals.length})
                          </span>
                        </div>
                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 font-mono">
                          {currencySymbol}{stageTotalVal.toLocaleString()}
                        </p>
                      </div>

                      {/* Opportunity Cards list */}
                      <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                        {stageDeals.length === 0 ? (
                          <div className="h-full border border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-lg flex items-center justify-center p-4">
                            <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider text-center">
                              {currentLang === 'tr' ? 'PROJE YOK' : 'EMPTY STAGE'}
                            </span>
                          </div>
                        ) : (
                          stageDeals.map((opp) => {
                            const cLink = contacts.find(c => c.id === opp.contactId);
                            const empAssigned = employees.find(e => e.id === opp.assignedTo);

                            return (
                              <div 
                                key={opp.id}
                                className="bg-white dark:bg-slate-950 border border-slate-155 dark:border-slate-800/80 p-3 rounded-lg shadow-xxs dark:shadow-none hover:border-sky-500 dark:hover:border-sky-500/50 transition-all font-sans relative group text-left space-y-2 select-none"
                              >
                                <div className="space-y-0.5">
                                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-450 transition-colors">
                                    {opp.title}
                                  </h4>
                                  <p className="text-[9px] text-slate-450 text-slate-500 dark:text-slate-400 font-medium">
                                    🏢 {cLink ? `${cLink.name} (${cLink.companyName})` : 'Unknown'}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-900 text-[10px] font-semibold">
                                  <span className="text-slate-900 dark:text-slate-300 font-extrabold font-mono text-[11px]">
                                    {currencySymbol}{opp.value.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                                    {opp.estCloseDate}
                                  </span>
                                </div>

                                {empAssigned && (
                                  <div className="flex items-center gap-1 text-[9px] text-slate-500 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded w-fit">
                                    <span className="font-bold uppercase tracking-wide text-[8px]">{currentLang === 'tr' ? 'ATANAN:' : 'OWNER:'}</span>
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">{empAssigned.name}</span>
                                  </div>
                                )}

                                {/* Card Actions */}
                                <div className="flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {opp.stage !== 'Won' && opp.stage !== 'Lost' ? (
                                    <div className="flex gap-1">
                                      {/* Move stages action buttons */}
                                      <select
                                        value={opp.stage}
                                        onChange={(e) => onUpdateOpportunityStage(opp.id, e.target.value as CRMOpportunity['stage'])}
                                        className="text-[8px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-0.5"
                                      >
                                        <option value="Lead">{currentLang === 'tr' ? 'Yeni Aday' : 'Lead'}</option>
                                        <option value="Contacted">{currentLang === 'tr' ? 'İletişim' : 'Contacted'}</option>
                                        <option value="Proposal_Sent">{currentLang === 'tr' ? 'Teklif' : 'Proposal'}</option>
                                        <option value="Negotiation">{currentLang === 'tr' ? 'Müzakere' : 'Negotiating'}</option>
                                        <option value="Won">{currentLang === 'tr' ? 'Kazanıldı ✓' : 'Won ✓'}</option>
                                        <option value="Lost">{currentLang === 'tr' ? 'Kaybedildi ✗' : 'Lost ✗'}</option>
                                      </select>
                                    </div>
                                  ) : (
                                    <span className="text-[8px] font-extrabold text-[#38bdf8] uppercase">
                                      {currentLang === 'tr' ? 'TAMAMLANDI KAYIT' : 'DEAL ARCHIVED'}
                                    </span>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (confirm(currentLang === 'tr' ? 'Bu proje fırsatını kaldırmak istediğinize emin misiniz?' : 'Are you sure you want to delete this opportunity?')) {
                                        onDeleteOpportunity(opp.id);
                                      }
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 text-[9px] cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Subtab 3: Support Tickets center */}
          {activeSubTab === 'tickets' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider">
                    {currentLang === 'tr' ? 'MUSTEİR DESTEK TALEBİ / SLA BİLETLERİ' : 'B2B CLIENT SUPPORT TICKETS'}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {currentLang === 'tr' ? 'Üretim süreçleri veya ürün sevkiyatı ile ilgili aktif talepler' : 'Active issues tracking hardware specifications or warranty cases'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-black">{currentLang === 'tr' ? 'Bilet B durumu:' : 'Filter:'}</span>
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-xs font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-350"
                  >
                    <option value="All">{currentLang === 'tr' ? 'Tüm Destekler' : 'All Issues'}</option>
                    <option value="Open">{currentLang === 'tr' ? 'Yeni / Açık' : 'Open Tickets'}</option>
                    <option value="In_Progress">{currentLang === 'tr' ? 'İşlem Yapılıyor' : 'In Progress'}</option>
                    <option value="Resolved">{currentLang === 'tr' ? 'Çözüldü' : 'Resolved Case'}</option>
                  </select>
                </div>
              </div>

              {/* Interaction List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredInteractions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    {currentLang === 'tr' ? 'Filtre ile eşleşen destek kaydı bulunmuyor.' : 'No active client support tickets correspond to the filters.'}
                  </div>
                ) : (
                  filteredInteractions.map((ticket) => {
                    const linkedContact = contacts.find(c => c.id === ticket.contactId);

                    return (
                      <div key={ticket.id} className="py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 px-1 rounded-lg transition-all">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          
                          {/* Top Labels */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded tracking-wider">
                              {currentLang === 'tr' ? 'DESTEK SÜRECİ' : 'SLA INCIDENT'}
                            </span>
                            
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              ticket.supportStatus === 'Resolved'
                                ? 'bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                : ticket.supportStatus === 'In_Progress'
                                ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                : 'bg-red-100/60 dark:bg-red-950/40 text-red-600'
                            }`}>
                              {ticket.supportStatus === 'Resolved' && (currentLang === 'tr' ? 'Çözüldü' : 'Resolved')}
                              {ticket.supportStatus === 'In_Progress' && (currentLang === 'tr' ? 'İşlemde' : 'In Progress')}
                              {ticket.supportStatus === 'Open' && (currentLang === 'tr' ? 'Açık' : 'Open')}
                            </span>

                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              📅 {ticket.date}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs tracking-tight">
                            {ticket.title}
                          </h4>

                          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed max-w-3xl">
                            {ticket.notes}
                          </p>

                          {linkedContact && (
                            <p className="text-[10px] text-slate-450 text-slate-400 mt-1 flex items-center gap-1">
                              <span>👤 {linkedContact.name} ({linkedContact.companyName})</span>
                              <span className="text-slate-300">/</span>
                              <span className="font-mono">{linkedContact.phone}</span>
                            </p>
                          )}
                        </div>

                        {/* Ticket State Actions */}
                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                          {ticket.supportStatus !== 'Resolved' && (
                            <>
                              <button
                                onClick={() => onUpdateSupportStatus(ticket.id, 'In_Progress')}
                                className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                              >
                                {currentLang === 'tr' ? 'İşlem Başlat' : 'In Progress'}
                              </button>
                              <button
                                onClick={() => onUpdateSupportStatus(ticket.id, 'Resolved')}
                                className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>{currentLang === 'tr' ? 'Çözüldü İşaretle' : 'Resolve'}</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(currentLang === 'tr' ? 'Bu destek biletini silmek istiyor musunuz?' : 'Are you sure you want to delete this ticket log?')) {
                                onDeleteInteraction(ticket.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                            title={currentLang === 'tr' ? 'Kaydı sil' : 'Delete log'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>

        {/* Right side contact information Detail panel (Interactive view sidebar) */}
        {selectedContactId && selectedContact && (
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <BadgeInfo className="w-4 h-4 text-sky-500" />
                <h3 className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-450 tracking-wider">
                  {currentLang === 'tr' ? 'İRTİBAT BİLGİ KARTI' : 'CONTACT PROFILE RADAR'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedContactId(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Brief Info */}
            <div className="space-y-3 font-sans pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-sky-500/15 text-sky-600 dark:text-sky-400 mb-1.5`}>
                  {selectedContact.status}
                </span>
                <h4 className="text-base font-black text-slate-850 dark:text-slate-100 tracking-tight leading-tight">
                  {selectedContact.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-455 dark:text-slate-400 font-semibold mt-0.5">
                  🏢 {selectedContact.companyName} — <span className="text-slate-400">{selectedContact.role}</span>
                </p>
              </div>

              {/* Direct Quick Communication channels */}
              <div className="text-xs space-y-2 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80 font-mono">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${selectedContact.email}`} className="text-sky-650 hover:underline text-sky-500 text-[11px] truncate">
                    {selectedContact.email || '—'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${selectedContact.phone}`} className="text-slate-700 dark:text-slate-300 text-[11px] hover:underline">
                    {selectedContact.phone || '—'}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] pt-1 border-t border-slate-100 dark:border-slate-850">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentLang === 'tr' ? 'Kayıt:' : 'Registered:'} {new Date(selectedContact.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedContact.notes && (
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 dark:text-slate-550 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'İLETİŞİM NOTU:' : 'CONTACT NOTES:'}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-950/20 p-2.5 rounded border border-slate-200/35 dark:border-slate-800/30 leading-relaxed italic">
                    "{selectedContact.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Sub-section: Linked Sales Deals */}
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                {currentLang === 'tr' ? 'İLİŞKİLİ SATIŞ PROJELERİ' : 'LINKED ACTIVE DEALS'} ({selectedContactDeals.length})
              </p>
              {selectedContactDeals.length === 0 ? (
                <p className="text-[10px] text-slate-450 italic">{currentLang === 'tr' ? 'Kayıtlı aktif bir fırsat yok.' : 'No active negotiation records listed.'}</p>
              ) : (
                selectedContactDeals.map(opp => (
                  <div key={opp.id} className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 p-2.5 rounded-lg flex items-center justify-between text-xs transition-all hover:border-slate-350">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{opp.title}</p>
                      <p className="text-[9px] text-sky-600 dark:text-sky-400 font-black uppercase mt-0.5">{opp.stage}</p>
                    </div>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-300">
                      {currencySymbol}{opp.value.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Sub-section: Live Interaction History Timeline */}
            <div className="space-y-3 pt-3.5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                  {currentLang === 'tr' ? 'ETKİLEŞİM & TARİHÇE GÜNLÜĞÜ' : 'INTERACTION FEED TIMELINE'}
                </p>
                <button
                  onClick={() => {
                    setNewInteraction(prev => ({ ...prev, contactId: selectedContact.id }));
                    setIsAddingInteraction(true);
                  }}
                  className="text-[9px] font-black uppercase text-sky-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{currentLang === 'tr' ? 'Ekle' : 'Add log'}</span>
                </button>
              </div>

              {selectedContactHistory.length === 0 ? (
                <div className="text-center py-4 bg-white dark:bg-slate-950/40 border border-slate-220 dark:border-slate-850 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-450 italic">{currentLang === 'tr' ? 'Henüz kaydedilmiş görüşme yok.' : 'No chronological interactions logged.'}</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-3.5 space-y-4">
                  {selectedContactHistory.map((item) => (
                    <div key={item.id} className="relative text-xs">
                      
                      {/* Timeline dot */}
                      <span className={`absolute -left-[19.5px] top-1.5 w-2 h-2 rounded-full border-2 border-slate-50 dark:border-slate-900 ${
                        item.type === 'Support_Ticket' ? 'bg-rose-500' : 'bg-sky-500'
                      }`} />

                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded leading-none">
                            {item.type}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">{item.date}</span>
                        </div>
                        <h5 className="font-bold text-slate-850 dark:text-slate-100 leading-tight">
                          {item.title}
                        </h5>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                          {item.notes}
                        </p>

                        {item.type === 'Support_Ticket' && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-850 text-[10px]">
                            <span className="text-rose-500 text-[8px] font-extrabold uppercase">Support Ticket Status:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.supportStatus}</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            if (confirm(currentLang === 'tr' ? 'Bu etkileşim kaydını silmek istiyor musunuz?' : 'Delete interaction history item?')) {
                              onDeleteInteraction(item.id);
                            }
                          }}
                          className="text-[9px] text-rose-500 hover:underline pt-0.5 block cursor-pointer"
                        >
                          {currentLang === 'tr' ? 'Kaydı Kaldır' : 'Remove Log'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* MODAL WINDOW 1: ADD / EDIT CRM CONTACT */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl max-w-lg w-full shadow-2xl text-left space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {editingContact 
                  ? (currentLang === 'tr' ? 'İRTİBAT KARTINI GÜNCELLE' : 'EDIT B2B CONTACT') 
                  : (currentLang === 'tr' ? 'YENİ B2B İRTİBAT EKLE' : 'ADD NEW B2B CONTACT')}
              </h3>
              <button 
                onClick={() => { setIsAddingContact(false); setEditingContact(null); }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Ad Soyad' : 'Contact Fullname'} *</label>
                  <input
                    type="text"
                    required
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="e.g. Miles Dyson"
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Firma / Kurum' : 'Organization Name'} *</label>
                  <input
                    type="text"
                    required
                    value={newContact.companyName}
                    onChange={(e) => setNewContact({ ...newContact, companyName: e.target.value })}
                    placeholder="e.g. Cyberdyne Systems"
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'E-posta Adresi' : 'Email Address'}</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="e.g. m.dyson@cyberdyne.io"
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Telefon Nu.' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 300-1991"
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Rol / Unvan' : 'Operational Role'}</label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder="e.g. Dir. of Research"
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'İlişki Durumu' : 'Relationship Status'}</label>
                  <select
                    value={newContact.status}
                    onChange={(e) => setNewContact({ ...newContact, status: e.target.value as CRMContact['status'] })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="Lead">{currentLang === 'tr' ? 'Aday Müşteri' : 'Lead'}</option>
                    <option value="Customer">{currentLang === 'tr' ? 'Aktif Müşteri' : 'Customer'}</option>
                    <option value="Support_Required">{currentLang === 'tr' ? 'Teknik Destek Talebi Var' : 'Support Required'}</option>
                    <option value="Inactive">{currentLang === 'tr' ? 'Pasif / Eski' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Ek İrtibat Notları' : 'Contact Background Notes'}</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  rows={3}
                  placeholder={currentLang === 'tr' ? 'B2B ihalesi şartnamesi, özel alaşım sipariş parametreleri...' : 'Specific calibration parameters, high volume framework demands...'}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddingContact(false); setEditingContact(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-805 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  {currentLang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  {editingContact ? (currentLang === 'tr' ? 'Profili Güncelle' : 'Update profile') : (currentLang === 'tr' ? 'İrtibatı Kaydet' : 'Create Contact')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: ADD SALES PIPELINE OPPORTUNITY */}
      {isAddingOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl max-w-lg w-full shadow-2xl text-left space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {currentLang === 'tr' ? 'YENİ ANLAŞMA / SATIŞ FIRSATI YAPILANDIR' : 'LAUNCH NEW SALES OPPORTUNITY'}
              </h3>
              <button 
                onClick={() => setIsAddingOpportunity(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpportunitySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Proje / Fırsat İsmi' : 'Opportunity Target Name'} *</label>
                <input
                  type="text"
                  required
                  value={newOpp.title}
                  onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                  placeholder="e.g. Aerospace Chassis Supply"
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'İlişkili Müşteri / Firma' : 'Associated Client'} *</label>
                  <select
                    required
                    value={newOpp.contactId}
                    onChange={(e) => setNewOpp({ ...newOpp, contactId: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="">-- {currentLang === 'tr' ? 'İrtibat Seçin' : 'Select Customer Contact'} --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Tahmini Anlaşma Değeri' : 'Estimated Deal Value'} ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newOpp.value}
                    onChange={(e) => setNewOpp({ ...newOpp, value: Number(e.target.value) })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Başlangıç Aşaması' : 'Pipeline State'}</label>
                  <select
                    value={newOpp.stage}
                    onChange={(e) => setNewOpp({ ...newOpp, stage: e.target.value as CRMOpportunity['stage'] })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="Lead">{currentLang === 'tr' ? 'Aday Veri' : 'Lead'}</option>
                    <option value="Contacted">{currentLang === 'tr' ? 'İletişim kuruldu' : 'Contacted'}</option>
                    <option value="Proposal_Sent">{currentLang === 'tr' ? 'Teklif İletildi' : 'Proposal Sent'}</option>
                    <option value="Negotiation">{currentLang === 'tr' ? 'Müzakereler' : 'Negotiation'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Kapanış Tarihi' : 'Est. Est close date'}</label>
                  <input
                    type="date"
                    required
                    value={newOpp.estCloseDate}
                    onChange={(e) => setNewOpp({ ...newOpp, estCloseDate: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Sorumlu Satış Temsilcisi' : 'Assigned Owner (Sales)'}</label>
                  <select
                    value={newOpp.assignedTo}
                    onChange={(e) => setNewOpp({ ...newOpp, assignedTo: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="">-- {currentLang === 'tr' ? 'Personel Atama' : 'Assign Specialist'} --</option>
                    {employees.filter(emp => emp.department === 'Sales' || emp.department === 'Operations').map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Süreç İçi Anotlar' : 'Requirements / Notes'}</label>
                <textarea
                  value={newOpp.notes}
                  onChange={(e) => setNewOpp({ ...newOpp, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingOpportunity(false)}
                  className="px-4 py-2 rounded-xl border border-slate-205 dark:border-slate-805 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer"
                >
                  {currentLang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  {currentLang === 'tr' ? 'Fırsatı Başlat' : 'Initialize Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 3: LOG CUSTOMER INTERACTION / SUPPORT TICKET */}
      {isAddingInteraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl max-w-lg w-full shadow-2xl text-left space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                <span>{currentLang === 'tr' ? 'ETKİLEŞİM VEYA DESTEK TALEBİ KAYDET' : 'RECORD INTERACTION / SLA TICKET'}</span>
              </h3>
              <button 
                onClick={() => setIsAddingInteraction(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInteractionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'İlgili B2B İrtibat' : 'Target Representative'} *</label>
                  <select
                    required
                    value={newInteraction.contactId}
                    onChange={(e) => setNewInteraction({ ...newInteraction, contactId: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="">-- {currentLang === 'tr' ? 'Kişi Seçin' : 'Select Customer'} --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Görüşme Tipi' : 'Channel Activity'}</label>
                  <select
                    value={newInteraction.type}
                    onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as CRMInteraction['type'] })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-805 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="Call">{currentLang === 'tr' ? 'Telefon Görüşmesi' : 'Phone Call Call'}</option>
                    <option value="Email">{currentLang === 'tr' ? 'E-Posta Havuzu' : 'Email correspondence'}</option>
                    <option value="Meeting">{currentLang === 'tr' ? 'Toplantı / Ziyaret' : 'Structured Face Meeting'}</option>
                    <option value="Support_Ticket">{currentLang === 'tr' ? 'Destek / Bilet Kaydı' : 'Incident Support Ticket'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Kayıt / Bilet Başlığı' : 'Log / Incident Title'} *</label>
                  <input
                    type="text"
                    required
                    value={newInteraction.title}
                    onChange={(e) => setNewInteraction({ ...newInteraction, title: e.target.value })}
                    placeholder="e.g. Diagnostic calibration payload feedback mismatch"
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Olay Tarihi' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={newInteraction.date}
                    onChange={(e) => setNewInteraction({ ...newInteraction, date: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              {newInteraction.type === 'Support_Ticket' && (
                <div className="space-y-1 bg-rose-500/[0.03] p-3 rounded-lg border border-rose-500/15">
                  <label className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Destek Bilet Başlangıç Durumu' : 'Ticket SLA Initial Priority State'}</label>
                  <select
                    value={newInteraction.supportStatus}
                    onChange={(e) => setNewInteraction({ ...newInteraction, supportStatus: e.target.value as CRMInteraction['supportStatus'] })}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-rose-200 dark:border-rose-950/40 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="Open">{currentLang === 'tr' ? 'Yeni / İşlemsiz Açık' : 'Open / Unassigned Incident'}</option>
                    <option value="In_Progress">{currentLang === 'tr' ? 'İşleme Alındı' : 'Active Investigation (In Progress)'}</option>
                    <option value="Resolved">{currentLang === 'tr' ? 'Çözüldü & Kapatıldı' : 'Archived Resolved Case'}</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{currentLang === 'tr' ? 'Detaylar ve Görüşme Özeti' : 'Incident Details / Log Summary'}</label>
                <textarea
                  required
                  value={newInteraction.notes}
                  onChange={(e) => setNewInteraction({ ...newInteraction, notes: e.target.value })}
                  rows={3}
                  placeholder={currentLang === 'tr' ? 'Görüşmede kararlaştırılan hususlar, biletin teknik sebepleri...' : 'Details about stress calibration logs, custom hydraulic measurements, specific support concerns...'}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingInteraction(false)}
                  className="px-4 py-2 rounded-xl border border-slate-205 dark:border-slate-850 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer"
                >
                  {currentLang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  {currentLang === 'tr' ? 'Girişi Kaydet' : 'Submit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
