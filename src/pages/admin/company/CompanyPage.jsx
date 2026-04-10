import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getCompanies } from '../../../services/company';
import { toast } from 'react-toastify';
import StatCard from './components/StatCard';
import CompanyRow from './components/CompanyRow';
import CompanyCard from './components/CompanyCard';
import PlaceholderRow from './components/PlaceholderRow';
import PlaceholderCard from './components/PlaceholderCard';
import CompanyDetailModal from './components/CompanyDetailModal';
import EditCompanyModal from './components/EditCompanyModal';
import ManageCompanyModal from './components/ManageCompanyModal';
import SuspendCompanyModal from './components/SuspendCompanyModal';
import ActivateCompanyModal from './components/ActivateCompanyModal';
import AddCompanyModal from './components/AddCompanyModal';

const CompanyPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);

  // Fetch companies - chỉ gọi 1 lần
  const { data: companiesResponse, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        // Lấy toàn bộ dữ liệu (không phân trang ở API)
        const response = await getCompanies({ per_page: 1000 });
        return response;
      } catch (error) {
        toast.error(error.response?.data?.error?.message || 'Failed to load companies');
        throw error;
      }
    },
  });

  const allCompanies = companiesResponse?.data || [];

  // Filter và search ở FE
  const filteredCompanies = useMemo(() => {
    let result = [...allCompanies];

    // Filter theo status
    if (statusFilter === 'active') {
      result = result.filter((c) => c.is_active);
    } else if (statusFilter === 'inactive') {
      result = result.filter((c) => !c.is_active);
    }

    // Search theo tên hoặc slug
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.slug?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allCompanies, statusFilter, searchQuery]);

  // Phân trang ở FE
  const perPage = 10;
  const totalCompanies = filteredCompanies.length;
  const totalPages = Math.ceil(totalCompanies / perPage) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredCompanies.slice(start, end);
  }, [filteredCompanies, currentPage]);

  const companies = paginatedCompanies;

  // Calculate stats for display
  const activeCompanies = allCompanies.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Companies & Subscriptions
          </h1>
          <p className="text-secondary mt-1">
            Manage tenant companies and their subscriptions
          </p>
        </div>
        <button
          onClick={() => setIsAddCompanyModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add New Company</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Companies"
          value={isCompaniesLoading ? '-' : allCompanies.length}
          icon={Building2}
          color="primary"
        />
        <StatCard
          title="Active Companies"
          value={isCompaniesLoading ? '-' : activeCompanies}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Users"
          value="-"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Enterprise Plans"
          value="-"
          icon={Building2}
          color="orange"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none outline-none text-sm cursor-pointer text-text"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Companies List - Header luôn hiển thị */}
      <div className="bg-background border border-secondary/20 rounded-lg overflow-hidden">
        {/* Desktop Table - Header luôn hiển thị */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/5 border-b border-secondary/20">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-text">
                  Company
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-text">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-text">
                  Plan
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-text">
                  Admins
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-text">
                  Users
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-text">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {isCompaniesLoading ? (
                [...Array(5)].map((_, i) => <PlaceholderRow key={i} />)
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Building2 size={48} className="mx-auto text-secondary/40 mb-4" />
                    <p className="text-secondary">No companies found</p>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    onViewDetail={() => {
                      setSelectedCompany(company);
                      setIsDetailModalOpen(true);
                    }}
                    onManage={() => {
                      setSelectedCompany(company);
                      setIsManageModalOpen(true);
                    }}
                    onEdit={() => {
                      setSelectedCompany(company);
                      setIsEditModalOpen(true);
                    }}
                    onSuspend={() => {
                      setSelectedCompany(company);
                      setIsSuspendModalOpen(true);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-secondary/10">
          {isCompaniesLoading ? (
            [...Array(3)].map((_, i) => <PlaceholderCard key={i} />)
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-secondary/40 mb-4" />
              <p className="text-secondary">No companies found</p>
            </div>
          ) : (
            companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewDetail={() => {
                  setSelectedCompany(company);
                  setIsDetailModalOpen(true);
                }}
                onManage={() => {
                  setSelectedCompany(company);
                  setIsManageModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isCompaniesLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary">
            Showing {(currentPage - 1) * perPage + 1} to{' '}
            {Math.min(currentPage * perPage, totalCompanies)} of{' '}
            {totalCompanies} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-secondary/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/5"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 text-sm text-text">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-secondary/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isDetailModalOpen && selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}
      {isEditModalOpen && selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedCompany(null);
          }}
        />
      )}
      {isManageModalOpen && selectedCompany && (
        <ManageCompanyModal
          company={selectedCompany}
          onClose={() => setIsManageModalOpen(false)}
          onEdit={() => {
            setIsManageModalOpen(false);
            setIsEditModalOpen(true);
          }}
          onSuspend={() => {
            setIsManageModalOpen(false);
            setIsSuspendModalOpen(true);
          }}
          onActivate={() => {
            setIsManageModalOpen(false);
            setIsActivateModalOpen(true);
          }}
        />
      )}
      {isSuspendModalOpen && selectedCompany && (
        <SuspendCompanyModal
          company={selectedCompany}
          onClose={() => setIsSuspendModalOpen(false)}
          onSuccess={() => {
            setIsSuspendModalOpen(false);
            setSelectedCompany(null);
          }}
        />
      )}
      {isActivateModalOpen && selectedCompany && (
        <ActivateCompanyModal
          company={selectedCompany}
          onClose={() => setIsActivateModalOpen(false)}
          onSuccess={() => {
            setIsActivateModalOpen(false);
            setSelectedCompany(null);
          }}
        />
      )}
      {isAddCompanyModalOpen && (
        <AddCompanyModal
          onClose={() => setIsAddCompanyModalOpen(false)}
          onSuccess={() => setIsAddCompanyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanyPage;
