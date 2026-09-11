import { useState, useEffect } from 'react';
import { Search, Filter, Video, FileText, Code, Eye, ArrowRight, Layers,
  Grid3X3, List, X } from 'lucide-react';
import { VideoViewer } from '../components/viewers/VideoViewer';
import { PdfViewer } from '../components/viewers/PdfViewer';
import { HtmlViewer } from '../components/viewers/HtmlViewer';
import { SkeletonCard } from '../components/Skeletons';

const CATEGORIES = ['All', 'Onboarding', 'Compliance', 'Technical', 'HR & Culture', 'General Reference'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title',  label: 'A–Z Title' },
  { value: 'views',  label: 'Most Viewed' },
];

const TYPE_CONFIG = {
  VIDEO: { icon: Video,    badge: 'bg-blue-100 text-blue-700 border border-blue-200',    icon_color: 'text-blue-500' },
  PDF:   { icon: FileText, badge: 'bg-red-100 text-red-600 border border-red-200',       icon_color: 'text-red-500' },
  HTML:  { icon: Code,     badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon_color: 'text-emerald-600' },
};

const fmt = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ContentCard = ({ item, onClick, viewMode }) => {
  const cfg = TYPE_CONFIG[item.contentType] || {};
  const Icon = cfg.icon;

  if (viewMode === 'list') {
    return (
      <button onClick={onClick}
        className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl
                   hover:border-brand-300 hover:shadow-md text-left transition group shadow-sm">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.badge}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 transition truncate">{item.title}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{item.description || 'No description.'}</p>
        </div>
        <div className="shrink-0 flex items-center gap-3 text-xs text-slate-400">
          <span>{item.category}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.viewCount}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition" />
      </button>
    );
  }

  return (
    <button onClick={onClick}
      className="w-full text-left bg-white border border-slate-200 rounded-2xl p-5
                 hover:border-brand-300 hover:shadow-md transition group flex flex-col shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.badge}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${cfg.badge}`}>
          {item.contentType}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 transition line-clamp-2 flex-1">
        {item.title}
      </h3>
      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
        {item.description || 'Internal reference material.'}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.viewCount}</span>
          <span>{fmt(item.fileSize)}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${cfg.badge}`}>{item.category}</span>
      </div>
    </button>
  );
};

export const ViewerLibraryPage = () => {
  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sort, setSort]           = useState('newest');
  const [viewMode, setViewMode]   = useState('grid');
  const [active, setActive]       = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All')   params.set('category', category);
      if (typeFilter !== 'All') params.set('contentType', typeFilter);
      if (search)               params.set('search', search);
      params.set('sort', sort);
      const res  = await fetch(`/api/content?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setList(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category, typeFilter, sort]);

  const handleOpen = async (item) => {
    setActive(item);
    try { await fetch(`/api/content/${item.id}`, { credentials: 'include' }); } catch (e) {}
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Content Library</h1>
        <p className="text-sm text-slate-400 mt-0.5">Browse and open protected training assets</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700
                       focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100
                       placeholder:text-slate-400 text-sm transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex gap-2 shrink-0">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-medium
                       focus:outline-none focus:border-brand-400 transition"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
        {['All', 'VIDEO', 'PDF', 'HTML'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
              typeFilter === t
                ? t === 'All' ? 'bg-slate-800 text-white border-slate-800' : TYPE_CONFIG[t]?.badge
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}>
            {t === 'VIDEO' && <Video    className="w-3.5 h-3.5" />}
            {t === 'PDF'   && <FileText className="w-3.5 h-3.5" />}
            {t === 'HTML'  && <Code     className="w-3.5 h-3.5" />}
            {t === 'All' ? 'All Types' : t}
          </button>
        ))}

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition whitespace-nowrap ${
              category === c
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Active filters */}
      {(search || category !== 'All' || typeFilter !== 'All') && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtered:</span>
          {search      && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">"{search}"</span>}
          {typeFilter !== 'All' && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">{typeFilter}</span>}
          {category   !== 'All' && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">{category}</span>}
          <button onClick={() => { setSearch(''); setCategory('All'); setTypeFilter('All'); load(); }}
            className="ml-1 text-red-400 hover:text-red-600 flex items-center gap-0.5">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      )}

      {/* Grid / List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {[1,2,3,4,5,6].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600">No Content Found</h3>
          <p className="text-sm text-slate-400">
            {search || category !== 'All' || typeFilter !== 'All'
              ? 'Try clearing your search or filter.'
              : 'No training content has been published yet.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {list.map(item => (
            <ContentCard key={item.id} item={item} onClick={() => handleOpen(item)} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Viewer Modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 border-b border-slate-100 gap-4 shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${TYPE_CONFIG[active.contentType]?.badge}`}>
                    {active.contentType}
                  </span>
                  <span className="text-xs text-slate-400">• {active.category}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800 truncate">{active.title}</h2>
                {active.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{active.description}</p>
                )}
              </div>
              <button
                onClick={() => setActive(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {active.contentType === 'VIDEO' && <VideoViewer item={active} />}
              {active.contentType === 'PDF'   && <PdfViewer   item={active} />}
              {active.contentType === 'HTML'  && <HtmlViewer  item={active} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
