import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrModule, ToastrService } from 'ngx-toastr';

import { CrmService } from '../../../services/crm.service';
import {
  Lead,
  LeadFilterOptions,
  LeadListResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadStatus,
  Timeline,
  BuyerType,
  PipelineStage,
  PipelineStatsDto,
  LeadActivity,
  FollowUpRequest,
  AssignLeadRequest,
  ConversionAnalyticsDto
} from '../../../models/crm.model';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    RouterLink
  ],
  templateUrl: './admin-leads.component.html',
  styleUrls: ['./admin-leads.component.css']
})
export class AdminLeadsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // View States
  currentView: 'dashboard' | 'pipeline' | 'list' | 'analytics' = 'dashboard';
  
  // Data
  leads: Lead[] = [];
  selectedLeads: string[] = [];
  pipelineStages: PipelineStage[] = [];
  totalLeads = 0;
  currentPage = 1;
  totalPages = 0;

  // Statistics
  stats: PipelineStatsDto = {
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    proposalLeads: 0,
    negotiationLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    conversionRate: 0,
    averageScore: 0,
    totalValue: 0,
    averageValue: 0
  };

  conversionStats: any = null;
  leadSources: any[] = [];
  topLeads: Lead[] = [];

  // Search & Filters
  searchTerm = '';
  filters: LeadFilterOptions = {
    limit: 10,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  // Available agents
  agents: any[] = [];

  // UI State
  isLoading = true;
  isSearching = false;
  isSaving = false;
  error = '';
  showLeadModal = false;
  showDetailModal = false;
  showAssignModal = false;
  showFollowUpModal = false;
  isEditMode = false;
  editingLead = false;
  selectedLead: Lead | null = null;

  // Forms
  leadForm!: FormGroup;
  followUpForm!: FormGroup;
  assignmentForm!: FormGroup;

  // Enums for templates
  leadStatuses = Object.values(LeadStatus);
  timelines = Object.values(Timeline);
  buyerTypes = Object.values(BuyerType);

  // Available sources
  leadSourceOptions = [
    'Website',
    'Referral',
    'Social Media',
    'Email Campaign',
    'Cold Call',
    'Walk-in',
    'Partner',
    'Advertisement',
    'Event'
  ];

  constructor(
    private crmService: CrmService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Lead Form
    this.leadForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      budget: [null, Validators.min(0)],
      budgetMax: [null, Validators.min(0)],
      timeline: ['', Validators.required],
      buyerType: ['', Validators.required],
      source: ['', Validators.required],
      notes: [''],
      country: [''],
      preferredContact: ['Email'],
      assignedTo: ['']
    });

    // Follow-up Form
    this.followUpForm = this.fb.group({
      followUpDate: ['', Validators.required],
      notes: ['']
    });

    // Assignment Form
    this.assignmentForm = this.fb.group({
      assignedTo: ['', Validators.required],
      notes: ['']
    });
  }

  // ===================
  // Data Loading Methods
  // ===================

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    // Load pipeline stats
    this.crmService.getPipelineStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading pipeline stats:', error);
          this.error = 'Failed to load dashboard data';
          this.isLoading = false;
          this.toastr.error('Failed to load dashboard data', 'Error');
        }
      });

    // Load top leads
    this.loadTopLeads();
    
    // Load conversion stats
    this.loadConversionStats();
  }

  private loadTopLeads(): void {
    this.crmService.getTopLeads(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (leads) => {
          this.topLeads = leads as any;
        },
        error: (error) => {
          console.error('Error loading top leads:', error);
        }
      });
  }

  private loadConversionStats(): void {
    this.crmService.getConversionStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.conversionStats = stats;
        },
        error: (error) => {
          console.error('Error loading conversion stats:', error);
        }
      });
  }

  loadLeads(): void {
    this.isLoading = true;
    this.isSearching = true;
    this.error = '';

    const searchFilters: LeadFilterOptions = {
      ...this.filters,
      searchTerm: this.searchTerm || undefined
    };

    this.crmService.getLeads(searchFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: LeadListResponse) => {
          this.leads = response.leads;
          this.totalLeads = response.total;
          this.totalPages = response.totalPages;
          this.isLoading = false;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error loading leads:', error);
          this.error = 'Failed to load leads';
          this.isLoading = false;
          this.isSearching = false;
          this.toastr.error('Failed to load leads', 'Error');
        }
      });
  }

  loadPipeline(): void {
    this.isLoading = true;
    
    // Initialize pipeline stages
    const stages: LeadStatus[] = [
      LeadStatus.New,
      LeadStatus.Contacted,
      LeadStatus.Qualified,
      LeadStatus.Proposal,
      LeadStatus.Negotiation
    ];

    this.pipelineStages = [];
    let completed = 0;

    stages.forEach(status => {
      this.crmService.getLeadsByStatus(status)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (leads) => {
            const stage: PipelineStage = {
              status,
              title: this.getStatusDisplayName(status),
              leads: leads as Lead[],
              count: leads.length,
              totalValue: leads.reduce((sum, l: any) => sum + (l.budgetMax || l.budget || 0), 0),
              color: this.getStageColor(status)
            };
            this.pipelineStages.push(stage);
            
            completed++;
            if (completed === stages.length) {
              // Sort stages in correct order
              this.pipelineStages.sort((a, b) => 
                stages.indexOf(a.status) - stages.indexOf(b.status)
              );
              this.isLoading = false;
            }
          },
          error: (error) => {
            console.error(`Error loading ${status} leads:`, error);
            completed++;
            if (completed === stages.length) {
              this.isLoading = false;
            }
          }
        });
    });
  }

  // ===================
  // View Management
  // ===================

  switchView(view: 'dashboard' | 'pipeline' | 'list' | 'analytics'): void {
    this.currentView = view;
    
    switch (view) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'pipeline':
        this.loadPipeline();
        break;
      case 'list':
        this.loadLeads();
        break;
      case 'analytics':
        this.loadAnalytics();
        break;
    }
  }

  loadAnalytics(): void {
    this.isLoading = true;
    
    // Load conversion stats
    this.crmService.getConversionStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.conversionStats = stats;
        },
        error: (error) => {
          console.error('Error loading conversion stats:', error);
        }
      });

    // Load buyer type distribution
    this.crmService.getLeadsByBuyerType()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          // Store for display
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading buyer type stats:', error);
          this.isLoading = false;
        }
      });
  }

  // ===================
  // Lead Management
  // ===================

  createNewLead(): void {
    this.isEditMode = false;
    this.selectedLead = null;
    this.resetLeadForm();
    this.showLeadModal = true;
  }

  editLead(lead: Lead): void {
    this.selectedLead = lead;
    this.isEditMode = true;
    this.showLeadModal = true;

    this.leadForm.patchValue({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      budget: lead.budget || null,
      budgetMax: lead.budgetMax || null,
      timeline: lead.timeline,
      buyerType: lead.buyerType,
      source: lead.source,
      notes: lead.notes || '',
      country: lead.country || '',
      preferredContact: lead.preferredContact || 'Email',
      assignedTo: lead.assignedTo || ''
    });
  }

  viewLeadDetails(lead: Lead): void {
    this.selectedLead = lead;
    this.showDetailModal = true;
  }

  saveLead(): void {
    if (this.leadForm.invalid) {
      this.toastr.error('Please fill in all required fields', 'Error');
      return;
    }

    this.isSaving = true;
    const formData = this.leadForm.value;

    const saveOperation = this.isEditMode && this.selectedLead
      ? this.crmService.updateLead(this.selectedLead.id, formData)
      : this.crmService.createLead(formData);

    saveOperation.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.showLeadModal = false;
          this.resetLeadForm();
          this.toastr.success(
            this.isEditMode ? 'Lead updated successfully' : 'Lead created successfully',
            'Success'
          );
          
          // Refresh current view
          if (this.currentView === 'list') {
            this.loadLeads();
          } else if (this.currentView === 'pipeline') {
            this.loadPipeline();
          } else {
            this.loadDashboardData();
          }
        },
        error: (error) => {
          console.error('Error saving lead:', error);
          this.isSaving = false;
          this.toastr.error('Failed to save lead', 'Error');
        }
      });
  }

  deleteLead(lead: Lead): void {
    if (!confirm(`Are you sure you want to delete lead "${lead.firstName} ${lead.lastName}"?`)) {
      return;
    }

    this.crmService.deleteLead(lead.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Lead deleted successfully', 'Success');
          
          // Refresh current view
          if (this.currentView === 'list') {
            this.loadLeads();
          } else if (this.currentView === 'pipeline') {
            this.loadPipeline();
          } else {
            this.loadDashboardData();
          }
        },
        error: (error) => {
          console.error('Error deleting lead:', error);
          this.toastr.error('Failed to delete lead', 'Error');
        }
      });
  }

  updateLeadStatus(leadId: string, status: LeadStatus): void {
    this.crmService.updateLeadStatus(leadId, { status: status.toString() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Lead status updated successfully', 'Success');
          
          // Refresh current view
          if (this.currentView === 'pipeline') {
            this.loadPipeline();
          } else {
            this.loadLeads();
          }
        },
        error: (error) => {
          console.error('Error updating lead status:', error);
          this.toastr.error('Failed to update lead status', 'Error');
        }
      });
  }

  convertLead(lead: Lead): void {
    if (!confirm(`Convert lead "${lead.firstName} ${lead.lastName}" to customer?`)) {
      return;
    }

    const conversionData = {
      company: lead.company,
      requirements: lead.notes,
      riskLevel: 'Medium'
    };

    this.crmService.convertLead(lead.id, conversionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Lead converted to customer successfully', 'Success');
          
          // Refresh current view
          if (this.currentView === 'list') {
            this.loadLeads();
          } else if (this.currentView === 'pipeline') {
            this.loadPipeline();
          } else {
            this.loadDashboardData();
          }
        },
        error: (error) => {
          console.error('Error converting lead:', error);
          this.toastr.error('Failed to convert lead', 'Error');
        }
      });
  }

  // ===================
  // Search & Filter
  // ===================

  searchLeads(): void {
    this.filters.offset = 0;
    this.currentPage = 1;
    this.loadLeads();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.currentPage = 1;
    this.loadLeads();
  }

  // ===================
  // Pagination
  // ===================

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.filters.offset = (page - 1) * (this.filters.limit || 10);
    this.loadLeads();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ===================
  // Bulk Operations
  // ===================

  toggleLeadSelection(leadId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedLeads.push(leadId);
    } else {
      this.selectedLeads = this.selectedLeads.filter(id => id !== leadId);
    }
  }

  toggleSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedLeads = [...this.leads.map(l => l.id)];
    } else {
      this.selectedLeads = [];
    }
  }

  bulkUpdateStatus(status: LeadStatus): void {
    if (this.selectedLeads.length === 0) {
      this.toastr.warning('Please select leads first', 'Warning');
      return;
    }

    if (!confirm(`Update ${this.selectedLeads.length} leads to status "${status}"?`)) {
      return;
    }

    // Process each lead
    let completed = 0;
    let errors = 0;

    this.selectedLeads.forEach(leadId => {
      this.crmService.updateLeadStatus(leadId, { status: status.toString() })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            completed++;
            if (completed + errors === this.selectedLeads.length) {
              this.finishBulkUpdate(completed, errors);
            }
          },
          error: () => {
            errors++;
            if (completed + errors === this.selectedLeads.length) {
              this.finishBulkUpdate(completed, errors);
            }
          }
        });
    });
  }

  private finishBulkUpdate(completed: number, errors: number): void {
    this.selectedLeads = [];
    
    if (errors === 0) {
      this.toastr.success(`${completed} leads updated successfully`, 'Success');
    } else {
      this.toastr.warning(
        `${completed} leads updated, ${errors} failed`,
        'Partial Success'
      );
    }

    // Refresh current view
    if (this.currentView === 'list') {
      this.loadLeads();
    } else if (this.currentView === 'pipeline') {
      this.loadPipeline();
    }
  }

  bulkDelete(): void {
    if (this.selectedLeads.length === 0) {
      this.toastr.warning('Please select leads first', 'Warning');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${this.selectedLeads.length} leads?`)) {
      return;
    }

    // Process each lead
    let completed = 0;
    let errors = 0;

    this.selectedLeads.forEach(leadId => {
      this.crmService.deleteLead(leadId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            completed++;
            if (completed + errors === this.selectedLeads.length) {
              this.finishBulkDelete(completed, errors);
            }
          },
          error: () => {
            errors++;
            if (completed + errors === this.selectedLeads.length) {
              this.finishBulkDelete(completed, errors);
            }
          }
        });
    });
  }

  private finishBulkDelete(completed: number, errors: number): void {
    this.selectedLeads = [];
    
    if (errors === 0) {
      this.toastr.success(`${completed} leads deleted successfully`, 'Success');
    } else {
      this.toastr.warning(
        `${completed} leads deleted, ${errors} failed`,
        'Partial Success'
      );
    }

    // Refresh current view
    if (this.currentView === 'list') {
      this.loadLeads();
    } else if (this.currentView === 'pipeline') {
      this.loadPipeline();
    }
  }

  // ===================
  // Modal Management Methods
  // ===================

  openCreateModal(): void {
    this.isEditMode = false;
    this.editingLead = false;
    this.selectedLead = null;
    this.resetLeadForm();
    this.showLeadModal = true;
  }

  openViewModal(lead: Lead): void {
    this.selectedLead = lead;
    this.showDetailModal = true;
  }

  openEditModal(lead: Lead): void {
    this.selectedLead = lead;
    this.isEditMode = true;
    this.editingLead = true;
    this.showLeadModal = true;

    this.leadForm.patchValue({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      budget: lead.budget || null,
      budgetMax: lead.budgetMax || null,
      timeline: lead.timeline,
      buyerType: lead.buyerType,
      source: lead.source,
      notes: lead.notes || '',
      country: lead.country || '',
      preferredContact: lead.preferredContact || 'Email',
      assignedTo: lead.assignedTo || ''
    });
  }

  openAssignModal(lead: Lead): void {
    this.selectedLead = lead;
    this.showAssignModal = true;
    this.assignmentForm.reset({
      assignedTo: lead.assignedTo || ''
    });
  }

  openFollowUpModal(lead: Lead): void {
    this.selectedLead = lead;
    this.showFollowUpModal = true;
    this.followUpForm.reset();
  }

  closeAllModals(): void {
    this.showLeadModal = false;
    this.showDetailModal = false;
    this.showAssignModal = false;
    this.showFollowUpModal = false;
    this.selectedLead = null;
  }

  // ===================
  // Filter and Data Retrieval Methods
  // ===================

  resetFilters(): void {
    this.searchTerm = '';
    this.filters = {
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.currentPage = 1;
    this.loadLeads();
  }

  applyFilters(): void {
    this.filters.offset = 0;
    this.currentPage = 1;
    this.loadLeads();
  }

  getLeadsByScore(scoreRange: 'Hot' | 'Warm' | 'Cold'): Lead[] {
    switch (scoreRange) {
      case 'Hot':
        return this.leads.filter(lead => lead.score >= 80);
      case 'Warm':
        return this.leads.filter(lead => lead.score >= 60 && lead.score < 80);
      case 'Cold':
        return this.leads.filter(lead => lead.score < 60);
      default:
        return [];
    }
  }

  getLeadsByStatus(status: LeadStatus | string): Lead[] {
    return this.leads.filter(lead => lead.status.toString() === status.toString());
  }

  getRecentLeads(): Lead[] {
    return this.topLeads.slice(0, 5);
  }

  // ===================
  // Selection Methods
  // ===================

  isAllSelected(): boolean {
    return this.leads.length > 0 && this.selectedLeads.length === this.leads.length;
  }

  isSelected(leadId: string): boolean {
    return this.selectedLeads.includes(leadId);
  }

  // ===================
  // Form Submission Methods
  // ===================

  createLead(): void {
    this.saveLead();
  }

  bulkAssign(): void {
    if (this.selectedLeads.length === 0) {
      this.toastr.warning('Please select leads first', 'Warning');
      return;
    }

    // Open a simple prompt for assignee
    const assignedTo = prompt('Enter the user to assign these leads to:');
    if (!assignedTo) {
      return;
    }

    let completed = 0;
    let errors = 0;

    this.selectedLeads.forEach(leadId => {
      this.crmService.assignLead(leadId, assignedTo, 'Bulk assignment')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            completed++;
            if (completed + errors === this.selectedLeads.length) {
              this.finishBulkAssignment(completed, errors);
            }
          },
          error: () => {
            errors++;
            if (completed + errors === this.selectedLeads.length) {
              this.finishBulkAssignment(completed, errors);
            }
          }
        });
    });
  }

  private finishBulkAssignment(completed: number, errors: number): void {
    this.selectedLeads = [];
    
    if (errors === 0) {
      this.toastr.success(`${completed} leads assigned successfully`, 'Success');
    } else {
      this.toastr.warning(
        `${completed} leads assigned, ${errors} failed`,
        'Partial Success'
      );
    }

    this.loadLeads();
  }

  // ===================
  // Helper Methods
  // ===================

  resetLeadForm(): void {
    this.leadForm.reset({
      preferredContact: 'Email'
    });
    this.selectedLead = null;
  }

  getStatusBadgeClass(status: LeadStatus): string {
    switch (status) {
      case LeadStatus.New: return 'bg-info';
      case LeadStatus.Contacted: return 'bg-primary';
      case LeadStatus.Qualified: return 'bg-success';
      case LeadStatus.Proposal: return 'bg-warning';
      case LeadStatus.Negotiation: return 'bg-orange';
      case LeadStatus.Converted: return 'bg-success';
      case LeadStatus.Lost: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Hot';
    if (score >= 60) return 'Warm';
    return 'Cold';
  }

  getStatusDisplayName(status: LeadStatus): string {
    return status.toString();
  }

  getStageColor(status: LeadStatus): string {
    switch (status) {
      case LeadStatus.New: return '#17a2b8';
      case LeadStatus.Contacted: return '#0d6efd';
      case LeadStatus.Qualified: return '#198754';
      case LeadStatus.Proposal: return '#ffc107';
      case LeadStatus.Negotiation: return '#fd7e14';
      default: return '#6c757d';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getTimelineColor(timeline: Timeline): string {
    switch (timeline) {
      case Timeline.Immediate: return 'danger';
      case Timeline.Within1Month: return 'warning';
      case Timeline.Within3Months: return 'info';
      default: return 'secondary';
    }
  }

  exportLeads(): void {
    this.toastr.info('Export feature coming soon!', 'Info');
  }

  // Expose Math for template
  Math = Math;

  // Fix API method calls to match service signatures
  scheduleFollowUp(): void {
    if (this.followUpForm.invalid || !this.selectedLead) {
      this.toastr.error('Please fill in all required fields', 'Error');
      return;
    }

    const followUpDate = new Date(this.followUpForm.value.followUpDate);
    const notes = this.followUpForm.value.notes || '';

    this.crmService.scheduleFollowUp(this.selectedLead.id, followUpDate, notes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Follow-up scheduled successfully', 'Success');
          this.showFollowUpModal = false;
          this.followUpForm.reset();
          this.loadLeads();
        },
        error: (error) => {
          console.error('Error scheduling follow-up:', error);
          this.toastr.error('Failed to schedule follow-up', 'Error');
        }
      });
  }

  assignLead(): void {
    if (this.assignmentForm.invalid || !this.selectedLead) {
      this.toastr.error('Please fill in all required fields', 'Error');
      return;
    }

    const assignedTo = this.assignmentForm.value.assignedTo;
    const notes = this.assignmentForm.value.notes || '';

    this.crmService.assignLead(this.selectedLead.id, assignedTo, notes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Lead assigned successfully', 'Success');
          this.showAssignModal = false;
          this.assignmentForm.reset();
          this.loadLeads();
        },
        error: (error) => {
          console.error('Error assigning lead:', error);
          this.toastr.error('Failed to assign lead', 'Error');
        }
      });
  }
}
